
var address = QueryString.address;
var token = QueryString.token;

// This has been moved to bimserverapi, can be removed in a day
String.prototype.firstUpper = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}


/**
 *
 * main script
 */
// Loads a model from BIMServer, builds an explorer tree UI.
// Clicking on a tree node fits the view to its scene object.

var apiVersion = new Date().getTime();

// Because the demo is in a subfolder compared to the BIMsurfer API, we tell require JS to use the "../" baseUrl

require.config({
	baseUrl: "../",
	urlArgs: "bust=" + version,
	waitSeconds: 15
});

document.addEventListener("DOMContentLoaded", function (event)
{

	require([
//	"bimsurfer/src/BimSurfer",
//	"bimsurfer/src/BimServerModelLoader",
//	"bimsurfer/src/StaticTreeRenderer",
//	"bimsurfer/src/MetaDataRenderer",
//	"bimsurfer/lib/domReady"
	],
		function ()
		{

			function processBimSurferModel(bimSurferModel)
			{
				console.log(bimSurferModel);
			}

			// Create a BIMserver API, we only need one of those for every server we connect to
			//var bimServerClient = new BimServerClient(address, null);
			var bimServerClient = window.BimServerClient;
//			console.log(bimServerClient);
			bimServerClient.init(function ()
			{
				var target = document.getElementById("returnedresult");
				target.innerHTML = "";
				var div = document.createElement("div");
				var h3 = document.createElement("h3");
				h3.textContent = address;
				div.appendChild(h3);
				var status = document.createElement("div");
				div.appendChild(status);
				var ul = document.createElement("ul");
				div.appendChild(ul);
				target.appendChild(div);

				bimServerClient.setToken(token, function ()
				{
					var models = {}; // roid -> Model

					// For this example, we'll fetch all the latest revisions of all the subprojects of the main project
					var poid = QueryString.poid;

					var nrProjects;

					function loadModels(models, totalBounds)
					{
//						console.log(totalBounds, models);

						for (var roid in models)
						{
							var model = models[roid];
							// Example 1: Load a full model

//							console.log(model);

							// Example 2: Load a list of objects (all walls and subtypes)
//							var objects = [];
//							model.getAllOfType("IfcWall", true, function(wall){
//								objects.push(wall);
//							}).done(function(){
//								console.log(model);
//								console.log(objects);
//							});

							// Example 3: Load the results of a query
							var objects = [];
							var query = {
								types: ["IfcDoor", "IfcWindow"]
							};
							model.query(query, function (object)
							{
								objects.push(object);
							}).done(function ()
							{

			//					console.log(objects);

								var totalFound = 0;

								objects.forEach(function (entry)
								{
									var li = document.createElement("li");
									var a = document.createElement("a");
									li.appendChild(a);
									a.textContent = entry.object._t + ": " + entry.object.Name;
									a.setAttribute("href", "BIMServer_item.html?address=" + encodeURIComponent(address) + "&token=" + token + "&poid=" + entry.object.oid + "&roid=" + roid + "&guid=" + entry.object.GlobalId);
									console.log(entry);
									ul.appendChild(li);
									totalFound++;
								});
							});
						}
					}

					bimServerClient.call("ServiceInterface", "getAllRelatedProjects", {poid: poid}, function (projects)
					{
						nrProjects = projects.length;

						var totalBounds = {
							min: [
								Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE
							],
							max: [
								-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE
							]
						};

						projects.forEach(function (project)
						{
							if (project.lastRevisionId != -1 && (project.nrSubProjects == 0 || project.oid != poid))
							{
								bimServerClient.getModel(project.oid, project.lastRevisionId, project.schema, false, function (model)
								{
									models[project.lastRevisionId] = model;

									bimServerClient.call("ServiceInterface", "getModelMinBounds", {roid: project.lastRevisionId}, function (minBounds)
									{
										bimServerClient.call("ServiceInterface", "getModelMaxBounds", {roid: project.lastRevisionId}, function (maxBounds)
										{
											if (minBounds.x < totalBounds.min[0])
											{
												totalBounds.min[0] = minBounds.x;
											}
											if (minBounds.y < totalBounds.min[1])
											{
												totalBounds.min[1] = minBounds.y;
											}
											if (minBounds.z < totalBounds.min[2])
											{
												totalBounds.min[2] = minBounds.z;
											}
											if (maxBounds.x > totalBounds.max[0])
											{
												totalBounds.max[0] = maxBounds.x;
											}
											if (maxBounds.y > totalBounds.max[1])
											{
												totalBounds.max[1] = maxBounds.y;
											}
											if (maxBounds.z > totalBounds.max[2])
											{
												totalBounds.max[2] = maxBounds.z;
											}
											nrProjects--;
											if (nrProjects == 0)
											{
												loadModels(models, totalBounds);
											}
										});
									});
								});
							}
							else
							{
								nrProjects--;
								if (nrProjects == 0)
								{
									loadModels(models, totalBounds);
								}
							}
						});
					});
				});
			});
		});
});
