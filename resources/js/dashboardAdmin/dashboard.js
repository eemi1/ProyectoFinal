//============================== PESTAÑA DASHBOARD PRINCIPAL ==============================
function chartVentas(){
    var chart = new CanvasJS.Chart("ventasChart", {
	theme: "light1", // "light2", "dark1", "dark2"
	animationEnabled: true, // change to true		
    axisY:{
        gridThickness: 0,
        lineThickness: 0,
        labelFormatter: function () { return ""; },

    },
    axisX:{
        lineThickness: 0,
        tickLength: 0,
        gridThickness: 0,
        reversed:true,
    },
	data: [
	{
		// Change type to "bar", "area", "spline", "pie",etc.
		type: "bar",
		dataPoints: [
			{ label: "Lunes",  y: 10  },
			{ label: "Martes", y: 15  },
			{ label: "Miércoles", y: 25  },
			{ label: "Jueves",  y: 30  },
			{ label: "Viernes",  y: 28  },
            { label: "Sábado",  y: 32  },
            { label: "Domingo",  y: 24  }
		]
	}
	]
});
chart.render();

}