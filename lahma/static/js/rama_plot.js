"use strict";

var getPhi = function(d) { return d["phi"]; }
var getPsi = function(d) { return d["psi"]; }
var getRamaZ = function(d) { return d["ramaZ"]; }
var isRamaOutlier = function(d) { return ("ramaClass" in d && d["ramaClass"].toUpperCase() == "O"); }
var isRamaMinority = function(d) { return ("ramaClass" in d && d["ramaClass"] == "M"); }

var isRamaZeroSize = function(d) { return (isNaN(d["phi"]) || isNaN(d["psi"])); }
var getRamaColor = function(d, i, data, dummy) {
    if (i == data.length - 1)
        return plot_colors[0];
    else if (isRamaOutlier(d))
        return plot_colors[1];
    else if (isRamaMinority(d))
        return plot_colors[2];
    else
        return plot_colors[3];
};
function plotRama(ramaPlot, nth_plot, data, other_plots){
    xScale.domain([-180, 180]);
    yScale.domain([-180, 180]);
    
    var explain_text = "This is the Ramachandran plot.<br/>Clustering is done to determine minority<br/>" + 
                       "cluster members and outliers."
    addXAxisInteger(ramaPlot, height2D, [-180, -120, -60, 0, 60, 120, 180], phi_letter, explain_text);
    addYAxis(ramaPlot, height2D, [-180, -120, -60, 0, 60, 120, 180], psi_letter);
    
    // draw dots
    ramaPlot.selectAll(".dot")
        .data(data)
        .enter()
          .append("circle")
          .classed("selectable", true)
          .attr("r", function(d, i) { return getSize(d, i, data, isRamaZeroSize); })
          .attr("cx", function(d) { return xMap(d, getPhi); })
          .attr("cy", function(d) { return yMap(d, getPsi); })
          .style("fill", function(d, i) { return getRamaColor(d, i, data);}) 
          .on("mouseover", function(d, i) {
              addMouseOver(getPdbid(d) + " " + getResType(d) + getResNum(d) + getChain(d) + "<br/> (" + getPhi(d) + 
                           ", " + getPsi(d) + ")" + "<br/> RamaZ = " + getRamaZ(d),
                           d, i, other_plots, nth_plot, data)
          })
          .on("click", function(d, i) { addMouseClick(d, i == data.length - 2) }) //TODO for some reason, +1 is added to the length of the data points here. Why???? 
                                                                                //temp solution: check if it is query by checking if second to last point...
          .on("mouseout", function(d, i) {
              addMouseOut(d, i, data, other_plots);
          });
    
    addLegend(ramaPlot, ["Query", "Outlier", "Minority", "Others"],
              [ plot_colors[0], plot_colors[1], plot_colors[2], plot_colors[3] ], height2D);
}
