            <div class="sidebar-menu">
                    <!--$for (var i=0;i<data.tree.length ;i++){-->
                        <!--$if(!data.tree[i]){-->
                            <!--$continue;-->
                        <!--$}-->
                        <!--$if (data.tree[i].type == "item"){-->
                            <a href="javascript:void(0);" class="nav-header menu-first treeMenu  " datapath="[${i}]"><i class="${data.tree[i]['icon-class']}"></i> ${data.tree[i].name}</a>
                        <!--$}else{-->
                            <a href="#menu${[i]}" class="nav-header menu-first collapsed " data-toggle="collapse" datapath="[${i}]"><i class="${data.tree[i]['icon-class']}"></i> ${data.tree[i].name}</a>
                            <ul id="menu${[i]}" class="nav nav-list collapse menu-second">
                                <!--$for (var ii=0;data.tree[i].children && ii<data.tree[i].children.length;ii++){-->
                                <li><a href="javascript:void(0);" datapath="[${i}].children[${ii}]" class="treeMenu"><i class="${data.tree[i].children[ii]['icon-class']}"></i>  ${data.tree[i].children[ii].name}</a></li>
                                <!--$}-->                        
                            </ul>
                        <!--$}-->
                    <!--$}-->
			</div>