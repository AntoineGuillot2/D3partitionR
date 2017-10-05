HTMLWidgets.widget({

	name: 'D3partitionR',

	type: 'output',

	factory: function(el, width, height) {
	  
	  var D3partitionR_data;

		///Rendering

		return {

			renderValue: function(D3partitionR) {
			  D3partitionR_data=D3partitionR
			  plot_d3partitionR(el,D3partitionR_data);





			},

			resize: function(width, height) {
			  console.log('resizing')
			  plot_d3partitionR(el,D3partitionR_data);


			}

		};
	}
});
