package com.breezefw.service.cms.workflow;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.databus.ContextTools;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breeze.framwork.servicerg.templateitem.CommTemplateItemParser;
import com.breeze.support.cfg.Cfg;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.templateitem.CMSDBOperItem;

public class CMSImportCSVFlow extends WorkFlowUnit{

	public static final String NAME = "CMSImportCSV";
	public static final String ITEMNAME = "CMSOperItem";
	private String _key = null;
	
	private Logger log = Logger.getLogger("com.breezefw.service.cms.workflow.CMSImportCSVFlow");
	
	@Override
	public String getName() {
		return NAME;
	}

	@Override
	public TemplateItemParserAbs[] getProcessParser() {
		return new TemplateItemParserAbs[] {
			new CommTemplateItemParser(ITEMNAME, CMSDBOperItem.class) 
		};
	}

	@Override
	public int process(BreezeContext root, ServiceTemplate serviceTemplate, String alias, int lastResult) {
		if (log.isLoggable(Level.FINE)) {
			String _log = "go Process [" + this.getName() + "]lastResult[" + lastResult + "]";
			log.fine(_log);
		}
		CMSDBOperItem item = (CMSDBOperItem) this.getItem(root, serviceTemplate, ITEMNAME);

		//获取data
		BreezeContext data = root.getContextByPath("_R.data");
		
		//获取alias
		String _alias = root.getContextByPath("_R.alias").getData().toString();
		//获取Metadata
		CMSMetadata _metadata = (CMSMetadata) root.getContextByPath(item.getMetadataContextPath() + "." + _alias).getData();
		//获取datadesc
		BreezeContext _datadesc = ContextTools.getBreezeContext4Json(_metadata.getDataDesc());
		
		//获取导入目标的alias
		String _importAlias = root.getContextByPath("_R.importAlias").getData().toString();
		//获取导入目标的breezeContext
		CMSMetadata _importMetadata = (CMSMetadata) root.getContextByPath(item.getMetadataContextPath() + "." + _importAlias).getData();
		//获取导入目标的datadesc
		BreezeContext _importDatadesc = ContextTools.getBreezeContext4Json(_importMetadata.getDataDesc());
		
		//获取所有key值
		Set<String> set = _datadesc.getMapSet();
		String filePath = null;
		//解析metadata查找类型为File的字段 第一个匹配上的就为上传文件路径
		for(String one : set){
			//获取一条数据
			BreezeContext _breezeContext = _datadesc.getContext(one);
			//判断是否为File类型
			if(_breezeContext.getContext("type").getData().toString().equals("File")){
				//获取data中的数据
				BreezeContext _data = data.getContext(one);
				//判断是否为空
				if(_data!=null&&!_data.isNull()){
					//获取文件路径
					filePath = Cfg.getCfg().getRootDir() + _data.getData().toString();
					//校验是否为csv文件
					if(filePath.indexOf(".csv")==-1){
						filePath = null;
						//code 102 file类型字段不是csv文件
						log.fine("you had selected a wrong type of the file!");
						return 102;
					}
				}
			}
		}
		if(filePath==null){
			//code 100 未找到file类型字段或file类型字段无值
			log.fine("can't find the File types of fields!");
			return 100;
		}else{
			return importCSVtoDB(filePath,_importDatadesc,_importMetadata,root,item);
		}
	}
	
	private int importCSVtoDB(String filePath,BreezeContext dateDesc,CMSMetadata metadata,BreezeContext root,CMSDBOperItem item){
		StringBuffer stringBuffer = new StringBuffer();
		
		stringBuffer.append("insert into ").append(metadata.getTableName()).append(" (");
		//记录执行条数
		int lineNumber = 1;
		//记录返回结果
		int code = 0;
		
		File file = new File(filePath);
		BufferedReader bufferedReader = null;
		try {
			//文件读取
			bufferedReader = new BufferedReader(new FileReader(file));
			String line = "";
			
			boolean hasAlias = false;
			boolean hasOpertime = false;
			
			//用于存放所有外链关键字
			BreezeContext outerLinkKey = new BreezeContext();
			//存放所有外链位置 idx,field
			Map<Integer, String> map = new HashMap<Integer, String>();

			while((line = bufferedReader.readLine())!=null){
				String[] oneLine = line.split(",");
				if(lineNumber==1){
					boolean isNotMetadata = true;
					for(int i=0;i<oneLine.length;i++){
						String one = oneLine[i];
						if(dateDesc.getContext(one)!=null){
							BreezeContext ourterLink = dateDesc.getContext(one).getContext("ourterLink");
							if(ourterLink!=null&&!ourterLink.isNull()&&!ourterLink.toString().equals("")){
								map.put(i, one);
								String[] key = ourterLink.toString().split("\\.");
								String alias = key[0];
								String value = key[1]; 
								if(dateDesc.getContext(one).getContext("fieldType").toString().equals("ourterField")){
									if(outerLinkKey.getContext(alias)!=null){
										continue;
									}else{
										Set<String> keys = dateDesc.getMapSet();
										for(String _keys : keys){
											BreezeContext _ourterLink = dateDesc.getContext(_keys).getContext("ourterLink");
											BreezeContext _fieldType = dateDesc.getContext(_keys).getContext("fieldType");
											if(_ourterLink!=null&&!_ourterLink.isNull()&&!_ourterLink.toString().equals("")){
												if(_ourterLink.toString().split("\\.")[0].equals(alias)&&!_fieldType.toString().equals("ourterField")){
													one = _keys;
												}
											}
										}
									}
								}else{
									if(outerLinkKey.getContext(alias)!=null){
										continue;
									}else{
										outerLinkKey.setContext(alias, new BreezeContext(value));
									}
								}
							}
							isNotMetadata = false;
						}else if(checkTitle(one,dateDesc)){
							one = _key;
							BreezeContext ourterLink = dateDesc.getContext(one).getContext("ourterLink");
							if(ourterLink!=null&&!ourterLink.isNull()&&!ourterLink.toString().equals("")){
								map.put(i, one);
								String[] key = ourterLink.toString().split("\\.");
								String alias = key[0];
								String value = key[1]; 
								if(dateDesc.getContext(one).getContext("fieldType").toString().equals("ourterField")){
									if(outerLinkKey.getContext(alias)!=null){
										continue;
									}else{
										Set<String> keys = dateDesc.getMapSet();
										for(String _keys : keys){
											BreezeContext _ourterLink = dateDesc.getContext(_keys).getContext("ourterLink");
											BreezeContext _fieldType = dateDesc.getContext(_keys).getContext("fieldType");
											if(_ourterLink!=null&&!_ourterLink.isNull()&&!_ourterLink.toString().equals("")){
												if(_ourterLink.toString().split("\\.")[0].equals(alias)&&!_fieldType.toString().equals("ourterField")){
													one = _keys;
												}
											}
										}
									}
								}else{
									if(outerLinkKey.getContext(alias)!=null){
										continue;
									}else{
										outerLinkKey.setContext(alias, new BreezeContext(value));
									}
								}
							}
							isNotMetadata = false;
						}else{
							isNotMetadata = true;
							break;
						}
						
						stringBuffer.append(one);
						if(one.equals("alias")){
							hasAlias = true;
						}
						if(one.equals("opertime")){
							hasOpertime = true;
						}
						
						if(i!=oneLine.length-1){
							stringBuffer.append(",");
						}else{
							if(!hasAlias){
								stringBuffer.append(",alias");
							}
							if(!hasOpertime){
								stringBuffer.append(",opertime");
							}
							stringBuffer.append(")value(");
							for(int j=0;j<oneLine.length;j++){
								stringBuffer.append("?");
								if(j!=oneLine.length-1){
									stringBuffer.append(",");
								}
							}
							if(!hasAlias){
								stringBuffer.append(",?");
							}
							if(!hasOpertime){
								stringBuffer.append(",?");
							}
							stringBuffer.append(")");
						}
					}
					if(isNotMetadata){
						log.fine("the first row is not metadata!");
						return 103; 
					}
				}else{
					//一行一行的插入
					try {
						ArrayList<Object> arrayList = new ArrayList<Object>();
						//存放所有已经找到的外链关键字的alias
						ArrayList<String> keyword = new ArrayList<String>();
						for(int i=0;i<oneLine.length;i++){
							//不是空表明这一列是外链相关字段
							if(map.get(i)!=null){
								BreezeContext one = dateDesc.getContext(map.get(i));
								String alias = one.getContext("ourterLink").toString().split("\\.")[0];
								if(keyword.indexOf(alias)!=-1){
									keyword.add(alias);
									//在元数据中查找所有跟其有关的外链数据
									Set<String> set = dateDesc.getMapSet();
									StringBuffer stringBuffer2 = new StringBuffer();
									String sql = "select ";
									stringBuffer2.append(" from ");
									CMSMetadata _metadata = (CMSMetadata) root.getContextByPath(item.getMetadataContextPath() + "." + alias).getData();
									stringBuffer2.append(_metadata.getTableName()).append(" where ");
									int idx = 0;
									for(String _one : set){
										BreezeContext _ourterLink = dateDesc.getContext(_one).getContext("ourterLink");
										BreezeContext _fieldType = dateDesc.getContext(_one).getContext("fieldType");
										if(_ourterLink!=null&&!_ourterLink.isNull()&&!_ourterLink.toString().equals("")){
											if(_ourterLink.toString().split("\\.")[0].equals(alias)&&!_fieldType.toString().equals("ourterField")){
												if(idx++==0){
													stringBuffer2.append(_ourterLink.toString().split("\\.")[1]).append(" = ?");
												}else{
													stringBuffer2.append(",").append(_ourterLink.toString().split("\\.")[1]).append(" = ?");
												}
											}else{
												sql+= _ourterLink.toString().split("\\.")[1];
											}
										}
									}
									sql += stringBuffer2.toString();
									
								}else{
									continue;
								}
							}
							arrayList.add(oneLine[i]);
						}
						if(!hasAlias){
							arrayList.add(metadata.getAlias());
						}
						if(!hasOpertime){
							arrayList.add(System.currentTimeMillis());
						}
						COMMDB.executeUpdate(stringBuffer.toString(), arrayList);
					} catch (Exception e) {
						code = 100000 + lineNumber;
						log.fine("line " + lineNumber + " error!");
						break;
					}
				}
				lineNumber++;
			}
		} catch (Exception e) {
			//若读取错误 表示文件不存在 code 101
			code = 101;
			log.severe("can't find the file!", e);
		} finally {
			if(bufferedReader != null){
				try {
					bufferedReader.close();
				} catch (IOException e) {
					log.severe("close bufferedReader exception!", e);
				}
			}
		}
		return code;
	}
	
	private boolean checkTitle(String one,BreezeContext dateDesc){
		//根据title检测是否为关键字段
		boolean check = false;
		Set<String> key = dateDesc.getMapSet();
		for(String k : key){
			if(dateDesc.getContext(k).getContext("title").getData().toString().equals(one)){
				_key = k;
				check = true;
			}
		}
		return check;
	}
}
