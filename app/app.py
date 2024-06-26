import urllib
from enum import Enum
from typing import List, Optional, Tuple, Dict, Any
import os
import uvicorn
from mangum import Mangum
import xarray
from fastapi import FastAPI, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field, root_validator
from starlette.middleware.cors import CORSMiddleware
import json
from datetime import datetime
import numpy as np
from rio_tiler.io.xarray import XarrayReader
from starlette.requests import Request
from rio_tiler.colormap import cmap
import zarr
import xarray as xr
from dateutil import tz
import matplotlib


class SchemeEnum(str, Enum):
    """TileJSON scheme choice."""

    xyz = "xyz"
    tms = "tms"


class TileJSON(BaseModel):
    """
    TileJSON model.

    Based on https://github.com/mapbox/tilejson-spec/tree/master/2.2.0

    """

    tilejson: str = "2.2.0"
    name: Optional[str]
    description: Optional[str]
    version: str = "1.0.0"
    attribution: Optional[str]
    template: Optional[str]
    legend: Optional[str]
    scheme: SchemeEnum = SchemeEnum.xyz
    tiles: List[str]
    grids: Optional[List[str]]
    data: Optional[List[str]]
    minzoom: int = Field(0, ge=0, le=30)
    maxzoom: int = Field(30, ge=0, le=30)
    bounds: List[float] = [-180, -90, 180, 90]
    center: Optional[Tuple[float, float, int]]

    @root_validator
    def compute_center(cls, values):
        """Compute center if it does not exist."""
        bounds = values["bounds"]
        if not values.get("center"):
            values["center"] = (
                (bounds[0] + bounds[2]) / 2,
                (bounds[1] + bounds[3]) / 2,
                values["minzoom"],
            )
        return values

    class Config:
        """TileJSON model configuration."""

        use_enum_values = True


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# url = 's3://imos-data-pixeldrill/vhnguyen/playground/multi-years'
# url = 's3://imos-data-lab-optimised/4428/dummy_sst/backup/'
print("read and cache Zarr store")
url = os.getenv("ZARR_STORE")
store = zarr.storage.FSStore(url)
cache = zarr.LRUStoreCache(store, max_size=2 ** 28)
ds = xr.open_dataset(cache, engine='zarr')


def np_dt64_to_dt(in_datetime: np.datetime64) -> str:
    """Convert numpy datetime64 to datetime"""
    utc = datetime.fromtimestamp(in_datetime.astype(int) / 1e9)
    to_zone = tz.tzlocal()
    local = utc.astimezone(to_zone)
    return local.strftime("%Y-%m-%dT%H:%M:%SZ")


@app.get("/time_range", response_class=Response)
def get_time_range(
):
    res = json.dumps({
        "min_time": np_dt64_to_dt(ds.time.values[0]),
        "max_time": np_dt64_to_dt(ds.time.values[-1])})
    return Response(res, media_type="application/json")


print("registering custom cmaps")
# cmap_names = ['plasma', 'viridis', 'cividis']
# for name in cmap_names:
#     cm = cmap.get(name)
#     values = list(cm.values())
#     values.pop(0)
#     values.insert(0, (255, 255, 255, 0))  # replace the first color with transparent
#     dict_val = {idx: tuple(value) for idx, value in enumerate(values)}
#     cmap = cmap.register({"imos_"+name: dict(dict_val)})

imos_rainbow = matplotlib.colors.LinearSegmentedColormap.from_list(
    'imos_rainbow', [
        '#ffffff00',
        '#10002B',
        '#1B004E',
        '#3C096C',
        '#5A189A',
        '#7B2CBF',
        '#9D4EDD',
        '#3F37C9',
        '#52D185',
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026',
        '#73001a'
    ],
    256,
)
x = np.linspace(0, 1, 256)
cmap_vals = imos_rainbow(x)[:, :]
cmap_uint8 = (cmap_vals * 255).astype('uint8')
imos_rainbow_dict = {idx: tuple(value) for idx, value in enumerate(cmap_uint8)}
cmap = cmap.register({"imos_rainbow": imos_rainbow_dict})

print("ready!")


@app.get("/time_range/date", response_class=Response)
def get_time_range(
        idx: int = Query(description="Time index"),
):
    da = ds.isel(time=[idx])
    res = json.dumps({
        "selected_date": np_dt64_to_dt(da.time.values[0])
    })
    return Response(res, media_type="application/json")


@app.get("/tiles/{z}/{x}/{y}", response_class=Response)
def tile(
        z: int,
        x: int,
        y: int,
        variable: str = Query(description="Zarr Variable"),
        idx: int = Query(description="Time index"),
        cmap_name: str = Query(description="CMAP name")
):
    cm = cmap.get(cmap_name)
    da = ds[variable][[idx]]
    # Make sure we are a CRS
    da.rio.write_crs(4326, inplace=True)

    with XarrayReader(da) as dst:
        img = dst.tile(x, y, z, tilesize=256)
        img.rescale(
            in_range=((260, 320),),
            out_range=((0, 255),)
        )
        content = img.render(colormap=cm)
        return Response(content, media_type="image/png")


@app.get(
    "/tilejson.json",
    response_model=TileJSON,
    responses={200: {"description": "Return a tilejson"}},
    response_model_exclude_none=True,
    tags=["API"],
)
def tilejson(
        request: Request,
        url: str = Query(description="Zarr URL"),
        variable: str = Query(description="Zarr Variable"),
        idx: int = Query(description="Time index")
):
    """Handle /tilejson.json requests."""
    kwargs: Dict[str, Any] = {"z": "{z}", "x": "{x}", "y": "{y}"}

    tile_url = request.url_for("tile", **kwargs)

    qs = [
        (key, value)
        for (key, value) in request.query_params._list
        if key not in ["tile_format"]
    ]
    if qs:
        tile_url += f"?{urllib.parse.urlencode(qs)}"

    with xarray.open_dataset(url, engine="zarr", decode_coords="all") as src:
        ds = src[variable][[idx]]
        # Make sure we are a CRS
        ds.rio.write_crs(4326, inplace=True)
        with XarrayReader(ds) as dst:
            return dict(
                bounds=dst.geographic_bounds,
                minzoom=dst.minzoom,
                maxzoom=dst.maxzoom,
                name="xarray",
                tilejson="2.1.0",
                tiles=[tile_url],
            )


### TEST ###
@app.get("/hello")
def get_root():
    return {"message": "FastAPI running in a Lambda function"}


###############################################################################
#   Handler for AWS Lambda                                                    #
###############################################################################

handler = Mangum(app)

###############################################################################
#   Run the self contained application                                        #
###############################################################################

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
