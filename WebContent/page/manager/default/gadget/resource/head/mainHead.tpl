<!--div class="navbar navbar-inverse navbar-fixed-top ">
    <div class="container-fluid">
		<div class="navbar-header">
				<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
					<span class="sr-only">Toggle navigatitopBarColoron</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<div style="float: left;">
				<img src="${data.logo }" style='width:52px;height:52px;'/>
				</div>
				<div class="navbar-brand">
				  <a  href="CMSBaseMgr.jsp" >
					 ${data.title}
				  </a>
				</div>
		</div>


			
		<div id="navbar" class="navbar-collapse collapse" >
		   <ul class="nav navbar-nav navbar-right" >
				<li>
					<a href="systemSetting.jsp?alias=cmsconfig&norole=true"><i class="icon-gear"></i>系统设置 </a>
				</li>
				<li>
					<a href="javascritp:void(0);" onclick="FW.page.createControl('a?type=pagesetting')"><i class="icon-gear"></i>页面设置 </a>
				</li>

				<li class="divider"></li>
				<li>
					<a href="./logout.jsp?goto=login"><i class="icon-signout"></i> 注销 </a>
				</li>
			</ul>
		</div>
	</div>

</div-->





  <div class="container" style="margin-left: 0px;margin-right: 0px;width:100%">
      <div style="float: left;">
      <img src="${data.logo }" style='width:52px;height:52px;'/>
      </div>
      <div class="navbar-brand" style="margin-left: 10px; ">
      <a  href="CMSBaseMgr.jsp" >
      ${data.title}
      </a>
      </div>
    
    
    
    <nav id="bs-navbar" class="collapse navbar-collapse">
      <ul class="nav navbar-nav">
        
      </ul>
      
      
      <div id="navbar" class="navbar-collapse collapse" >
		   <ul class="nav navbar-nav navbar-right" >
				<li>
					<a href="systemSetting.jsp?alias=cmsconfig&norole=true"><i class="icon-gear"></i>系统设置 </a>
				</li>
				<li>
					<a href="javascritp:void(0);" onclick="FW.page.createControl('a?type=pagesetting')"><i class="icon-gear"></i>页面设置 </a>
				</li>

				<li class="divider"></li>
				<li>
					<a href="./logout.jsp?goto=login"><i class="icon-signout"></i> 注销 </a>
				</li>
			</ul>
		</div>
    </nav>
    
    
    
  </div>
