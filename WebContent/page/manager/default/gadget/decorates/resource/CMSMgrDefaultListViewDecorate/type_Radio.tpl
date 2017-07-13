<td>
   <!--$if (data != null && data.data != null){-->
     <!--$var chooseValue = data.metadata.valueRange;-->
     <!--$var _data = "";-->
     <!--$ for (var k = 0; k < chooseValue.length; k++) {-->
           <!--$for (var l in chooseValue[k]) {-->
                <!--$if (chooseValue[k][l] == data) {-->
                     ${l}
                <!--$break;}-->
           <!--$}-->
     <!--$ }-->
   <!--$}-->
</td>