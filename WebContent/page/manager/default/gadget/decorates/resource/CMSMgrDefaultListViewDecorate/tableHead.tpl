<th> 
    <a href='#' onclick="FireEvent.changeListOrderBy('${data.fieldName}');return false;">${data.title}</a>
    <!--$if (data.status == 1){-->
        <a href='#' onclick="FireEvent.changeListOrderBy('${data.fieldName}');return false;">
                  <apan class='pull-right glyphicon glyphicon-arrow-up'></span>
        </a>
    <!--$}else if(data.status == 2){-->
        <a href='#' onclick="FireEvent.changeListOrderBy('${data.fieldName}');return false;">
                  <apan class='pull-right glyphicon glyphicon-arrow-down'></span>
        </a>
    <!--$}-->
</th>