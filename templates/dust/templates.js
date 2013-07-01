(function(){dust.register("add",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"header\">\n\t<h2>Add A New Record</h2>\n   </div>\n<div data-role=\"popup\" id=\"popupInfo\" class=\"ui-content\" data-theme=\"e\" style=\"max-width:350px;\">\n\t<a href=\"#\" data-rel=\"back\" data-role=\"button\" data-theme=\"a\" data-icon=\"delete\" data-iconpos=\"notext\" class=\"ui-btn-right\">Close</a>\n\t<p>Look at your solar inverter unit and read the total kWh production and enter the value in this field</p>\n</div>\n\n<div data-role=\"content\">\n\t<label for=\"value\">Enter current total kWh <a href=\"#popupInfo\" data-rel=\"popup\" data-role=\"button\" class=\"ui-icon-alt\" data-inline=\"true\" data-transition=\"pop\" data-icon=\"info\" data-theme=\"e\" data-iconpos=\"notext\">Learn more</a></label>\n\t<input type=\"number\" name=\"value\" pattern=\"[0-9]*\" id=\"value\" value=\"\" placeholder=\"Enter a value\">\n\t<div name=\"time\" id=\"time\" class=\"i-txt\"></div>\n\t<button id=\"save\" data-theme=\"b\">Save</button>\n</div><!-- /content -->");}return body_0;})();(function(){dust.register("home",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"header\">\n\t<h1>Summary</h1>\n</div><!-- /header -->\n\n<div data-role=\"content\" class=\"ui-icon-nodisc\">\n\t<div id=\"chart\" style=\"min-width: 300px; height: 300px; margin: 0 auto\"></div>\n</div><!-- /content -->\n\n<div data-role=\"footer\" data-tap-toggle=\"false\" data-tap-toggle=\"false\" data-fullscreen=\"false\" data-position=\"fixed\">\n\t<div data-role=\"navbar\" data-iconpos=\"top\">\n\t\t<ul class=\"nav-search ui-icon-nodisc\">\n\t\t   <li><a href=\"#\" data-iconshadow=\"false\" data-icon=\"home\" class=\"ui-btn-active ui-state-persist\" data-transition=\"slidefade\">Home</a></li>\n\t\t   <li><a href=\"#viewRecords\" data-iconshadow=\"false\" data-icon=\"grid\" data-transition=\"slidefade\">Records</a></li>\n\t\t   <li><a href=\"#add\" data-iconshadow=\"false\" data-icon=\"add\" data-rel=\"dialog\" data-transition=\"slidefade\">Add</a></li>\n\t\t   <li><a href=\"#menu-panel\" data-iconshadow=\"false\" data-icon=\"bars\">More</a></li>\n\t\t</ul>\n\t</div><!-- /navbar -->\n</div><!-- /footer -->\n").partial("menu-panel",ctx,null);}return body_0;})();(function(){dust.register("menu-panel",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"panel\" id=\"menu-panel\" data-theme=\"a\" data-position=\"right\" data-display=\"overlay\">\n\t<ul data-role=\"listview\" data-theme=\"a\">\n\t\t<li data-icon=\"delete\"><a href=\"#\" data-rel=\"close\">Close menu</a></li>\n\t\t<li><a href=\"#\" class=\"logout\">Sign out</a></li>\n\t\t<li><a href=\"#\" class=\"changePassword\">Change Password</a></li>\n\t\t<li><a href=\"#\" class=\"clear\">Reset</a></li>\n\t\t<li><a href=\"#\" class=\"backup\">Backup Your Data</a></li>\n\t\t<li><a href=\"#\" class=\"sync\">Resync</a></li>\n\t\t<li><a href=\"#\" class=\"export\">Upload</a></li>\n\t\t<li><a href=\"#\" class=\"setRate\">Set kWh Rate</a></li>\n\t</ul>\n</div>");}return body_0;})();(function(){dust.register("recordItems",body_0);function body_0(chk,ctx){return chk.section(ctx.get("entries"),ctx,{"block":body_1},null);}function body_1(chk,ctx){return chk.write("<tr><td>").reference(ctx.get("day"),ctx,"h").write(" ").reference(ctx.get("date"),ctx,"h").write("</td><td>").reference(ctx.get("dayProduction"),ctx,"h").write(" kWh</td><td>").reference(ctx.get("total"),ctx,"h").write(" kWh</td><td>$").reference(ctx.get("savings"),ctx,"h").write("</td><td>").section(ctx.get("recId"),ctx,{"block":body_2},null).write("</td></tr>\n");}function body_2(chk,ctx){return chk.write("<button href=\"#\" class=\"deleteItem\" data-id=\"").reference(ctx.get("recId"),ctx,"h").write("\" data-role=\"button\" data-mini=\"true\" data-theme=\"f\">X</button>");}return body_0;})();(function(){dust.register("viewRecords",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"header\">\n\t<h1>Records</h1>\n</div><!-- /header -->\n\n<div data-role=\"content\" class=\"ui-icon-nodisc\">\n\t<table data-role=\"table\" id=\"table-custom-2\" data-mode=\"columntoggle\" class=\"history ui-body-d ui-shadow table-stripe ui-responsive\" data-column-btn-theme=\"b\" data-column-popup-theme=\"a\">\n\t\t<thead>\n\t\t  <tr class=\"ui-bar-d\">\n\t\t    <th>Date</th>\n\t\t    <th>Day</th>\n\t\t    <th>Total</th>\n\t\t    <th>Savings</th>\n\t\t    <th></th>\n\t\t  </tr>\n\t\t</thead>\n\t\t<tbody>\n\t\t\t\n\t\t</tbody>\n\t</table>\n</div><!-- /content -->\n\n<div data-role=\"footer\" data-tap-toggle=\"false\" data-fullscreen=\"false\" data-position=\"fixed\">\n\t<div data-role=\"navbar\" data-iconpos=\"top\">\n\t\t<ul class=\"ui-icon-nodisc\">\n\t\t   <li><a href=\"#home\" data-iconshadow=\"false\" data-icon=\"home\" data-transition=\"slidefade\">Home</a></li>\n\t\t   <li><a href=\"#\" data-iconshadow=\"false\" data-icon=\"grid\" class=\"ui-btn-active ui-state-persist\" data-transition=\"slidefade\">Records</a></li>\n\t\t   <li><a href=\"#add\" data-iconshadow=\"false\" data-icon=\"add\" data-rel=\"dialog\" data-transition=\"slidefade\">Add</a></li>\n\t\t   <li><a href=\"#menu-panel\" data-iconshadow=\"false\" data-icon=\"bars\">More</a></li>\n\t\t</ul>\n\t</div><!-- /navbar -->\n</div><!-- /footer -->\n\n").partial("menu-panel",ctx,null);}return body_0;})();