<!--$if(data){-->
	<div class="col-xs-3">
		<div class="panel panel-default">
			<div class="widget-header header-color-blue2 clearfix" style="margin:5px 10px;">
				<h4 class="lighter smaller pull-left">栏目目录</h4>
			</div>	
			<div id="aliasNodeTree" class="btn-group" style="margin:5px 10px;">
				<button class="btn btn-xs btn-success" onClick="FireEvent.treeTopAdd();">
					<i class="icon-plus"></i>
					添加顶节点
				</button>
				<button class="btn btn-xs btn-primary" onClick="FireEvent.treeAdd();">
					<i class="icon-plus"></i>
					增加
				</button>
				<button class="btn btn-xs btn-warning" onClick="FireEvent.treeMod();">
					<i class="icon-cog"></i>
					编辑
				</button>
				<button class="btn btn-xs btn-danger" onClick="FireEvent.treeDel();">
					<i class="icon-trash"></i>
					删除
				</button>
			</div>
			<div style="margin:5px 10px;">
				<div class="tree tree-selectable" id="nodeTree">
	
				</div>
			</div>
		</div>
	</div>
	<div class="col-xs-9">
		${p:("childrenData",0)}
	</div>
<!--$}else{-->
	<div class="col-xs-12">
		${p:("childrenData",0)}
	</div>
<!--$}-->