import { useEffect } from "react";
import L from "leaflet";
import './MapLegend.css';

function MapLegend({map}) {
  useEffect(() => {
    if (map) {
      const getColor = d => {
        return d > 310
          ? "#f46d43"
          : d > 305
            ? "#fdae61"
            : d > 300
              ? "#fee090"
              : d > 295
                ? "#52D185"
                : d > 290
                  ? "#3F37C9"
                    : d > 285
                      ? "#9D4EDD"
                        : d > 280
                          ? "#7B2CBF"
                          : d > 275
                            ? "#5A189A"
                            : "#3C096C";
      };
      const legend = L.control({position: "bottomright"});
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        const grades = [270, 275, 280, 285, 290, 295, 300, 305, 310]
        // list above produced by below Python statement where 260 is the lowest recorded kelvin degree and 321 is the highest
        // for x in range(260, 321):
        //   if x % 5 == 0:
        //   grades.append(x)
        let labels = [];
        let from;
        let to;

        for (let i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];

          labels.push(
            '<i style="background:' +
            getColor(from + 1) +
            '"></i> ' +
            Math.round((from - 273.15) * 100) / 100 +
            (to ? " &ndash; " + Math.round((to - 273.15) * 100) / 100 : "+") + ' °C'
          );
        }

        div.innerHTML = labels.join("<br>");
        return div;
      };
      legend.addTo(map);
    }
  }, [map]);
  return null;
}

export default MapLegend;
