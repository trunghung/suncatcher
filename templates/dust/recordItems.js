(function(){dust.register("recordItems",body_0);function body_0(chk,ctx){return chk.section(ctx.get("entries"),ctx,{"block":body_1},null);}function body_1(chk,ctx){return chk.write("<tr><td>").reference(ctx.get("day"),ctx,"h").write(" ").reference(ctx.get("date"),ctx,"h").write("</td><td>").reference(ctx.get("dayProduction"),ctx,"h").write(" kWh</td><td>").reference(ctx.get("total"),ctx,"h").write(" kWh</td><td>$").reference(ctx.get("savings"),ctx,"h").write("</td><td>").section(ctx.get("recId"),ctx,{"block":body_2},null).write("</td></tr>\n");}function body_2(chk,ctx){return chk.write("<button href=\"#\" class=\"deleteItem\" data-id=\"").reference(ctx.get("recId"),ctx,"h").write("\" data-role=\"button\" data-mini=\"true\" data-theme=\"f\">X</button>");}return body_0;})();