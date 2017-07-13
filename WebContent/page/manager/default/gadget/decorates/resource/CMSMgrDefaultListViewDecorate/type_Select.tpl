<td>
<!--$var vrange = data.metadata.valueRange;-->
<!--$var flag = false;-->
<!--$for (var i=0;i<vrange.length;i++){-->
    <!--$for (var n in vrange[i]){-->
         <!--$if (data.data == vrange[i][n]){flag=true;-->
             ${n}
         <!--$}-->
    <!--$}-->
<!--$}-->
<!--$if (flag == false){-->
${data.data}
<!--$}-->
</td>