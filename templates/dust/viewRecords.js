(function(){dust.register("viewRecords",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"header\">\n\t<h1>Records</h1>\n</div><!-- /header -->\n\n<div data-role=\"content\" class=\"ui-icon-nodisc\">\n\t<table data-role=\"table\" id=\"table-custom-2\" data-mode=\"columntoggle\" class=\"history ui-body-d ui-shadow table-stripe ui-responsive\" data-column-btn-theme=\"b\" data-column-popup-theme=\"a\">\n\t\t<thead>\n\t\t  <tr class=\"ui-bar-d\">\n\t\t    <th>Date</th>\n\t\t    <th>Day</th>\n\t\t    <th>Total</th>\n\t\t    <th>Savings</th>\n\t\t    <th></th>\n\t\t  </tr>\n\t\t</thead>\n\t\t<tbody>\n\t\t\t\n\t\t</tbody>\n\t</table>\n</div><!-- /content -->\n\n<div data-role=\"footer\" data-tap-toggle=\"false\" data-fullscreen=\"false\" data-position=\"fixed\">\n\t<div data-role=\"navbar\" data-iconpos=\"top\">\n\t\t<ul class=\"ui-icon-nodisc\">\n\t\t   <li><a href=\"#home\" data-iconshadow=\"false\" data-icon=\"home\" data-transition=\"slidefade\">Home</a></li>\n\t\t   <li><a href=\"#\" data-iconshadow=\"false\" data-icon=\"grid\" class=\"ui-btn-active ui-state-persist\" data-transition=\"slidefade\">Records</a></li>\n\t\t   <li><a href=\"#add\" data-iconshadow=\"false\" data-icon=\"add\" data-rel=\"dialog\" data-transition=\"slidefade\">Add</a></li>\n\t\t   <li><a href=\"#menu-panel\" data-iconshadow=\"false\" data-icon=\"bars\">More</a></li>\n\t\t</ul>\n\t</div><!-- /navbar -->\n</div><!-- /footer -->\n\n").partial("menu-panel",ctx,null);}return body_0;})();