<!--$if(data.data){-->
				<!--$for(var i=0;i<data.data.length;i++){-->
                    
                    
                      <div class="col-sm-6 col-md-4">
                        <div class="thumbnail">
                          <img src="${Cfg.baseUrl}/${data.data[i].picUrl}" srcValue="${data.data[i].picUrl}" alt="${data.data[i].alt}">
                          <div class="caption">
                            <h3>${data.data[i].alt}</h3>
                            <p><a href="#" class="btn btn-primary btn-xs" role="button"  onclick="FireEvent.removeOne('${i}')">删除</a></p>
                          </div>
                        </div>
                      </div>

                    
                    
                    
				<!--$}-->
<!--$}-->