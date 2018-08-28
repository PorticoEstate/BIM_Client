
var address = QueryString.address;
var token = QueryString.token;
var guid = QueryString.guid;
var roid = QueryString.roid;

// This has been moved to bimserverapi, can be removed in a day
String.prototype.firstUpper = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}

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

			// Create a BIMserver API, we only need one of those for every server we connect to
			//var bimServerClient = new BimServerClient(address, null);
			var bimServerClient = window.BimServerClient;
//			console.log(bimServerClient);
			bimServerClient.init(function ()
			{

				bimServerClient.setToken(token, function ()
				{
					function print_item(item)
					{
						console.log(item);

						var target = document.getElementById("returnedresult");
						target.innerHTML = "";
						var div = document.createElement("div");
						var h3 = document.createElement("h3");
						h3.textContent = item.type;
						div.appendChild(h3);
						var ul = document.createElement("ul");
						div.appendChild(ul);
						target.appendChild(div);
		
						var values = item.values || {};
						values.forEach(function (entry)
						{
							console.log(entry.__type);

							if(entry.__type == 'SSimpleDataValue')
							{
								var li = document.createElement("li");
								li.textContent = entry.fieldName + ' => ' + entry.stringValue;
								ul.appendChild(li);
							}
						});
					}

					bimServerClient.call("LowLevelInterface", "getDataObjectByGuid", {roid: roid, guid:guid }, function (item)
					{
						print_item(item);
					});
				});
			});
		});
});
