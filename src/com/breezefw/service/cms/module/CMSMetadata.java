package com.breezefw.service.cms.module;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.support.tools.GsonTools;
import com.breezefw.ability.btl.BTLExecutor;
import com.breezefw.ability.btl.BTLParser;
import com.breeze.framwork.databus.ContextTools;

/**
 * 这是普通的javabean 其成员和数据CMSMetaddata保持一致，但是自身设定包含了父亲和儿子的节点
 * 
 * @author Administrator
 * 
 */
public class CMSMetadata {
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.module.CMSMetadata");
	private CMSMetadata father;
	private ArrayList<CMSMetadata> Children;
	private int cid;
	private String parentAlias;
	private String dataDesc;
	private String dataDescWithFather;
	private String alias;
	private String tableName;
	private String showName;
	private BTLExecutor[] dataOwner;
	private HashMap<String, CMSMetadataField> fieldMap;
	private boolean viewNeede = false;// 2013-10-15是否需要视图辅助
	private String dataRefresh;
	private String outAlias ;//2014-01-17 增加outAlias支持多对多关联关系批量添加功能
	private BreezeContext otherChild;
	//2014-06-17罗光瑜添加 增加memo字段
	private BreezeContext dataMemo;
	//2014-09-04罗光瑜添加 增加真正继承的父亲节点
	private String superid;
	//2015年10月21日15:14:49 FrankCheng 增加isMuliTab字段
	private String isMuliTab;
	//2015年10月30日17:37:25 FrankCheng 增加checkField字段
	private String checkField;
	private CMSMetadata superMetadata;
	private HashSet<CMSMetadata> subMetadata = new HashSet<CMSMetadata>();
	private ArrayList<String> allSubAlias = null;
	
	public BreezeContext getDataMemo() {
		return dataMemo;
	}
	
	
	
	public String getIsMuliTab() {
		return isMuliTab;
	}



	public void setIsMuliTab(String isMuliTab) {
		this.isMuliTab = isMuliTab;
	}


	public String getCheckField() {
		return checkField;
	}


	public void setCheckField(String checkField) {
		this.checkField = checkField;
	}



	public String getSuperid(){
		return this.superid;
	}
	public void setSupper(CMSMetadata sf){
		this.superMetadata = sf;
	}
	
	public CMSMetadata getSuper(){
		return this.superMetadata;
	}
	
	public HashSet<CMSMetadata> getSubMetadata(){
		return this.subMetadata;
	}
	
	public ArrayList<String> getAllSubAlias(){
		if (this.allSubAlias != null){
			return this.allSubAlias;
		}
		this.allSubAlias = new ArrayList<String>();
		this.allSubAlias.add(this.alias);
		for (CMSMetadata sub : this.subMetadata){
			ArrayList subList = sub.getAllSubAlias();
			if (subList == null){
				this.allSubAlias.add(sub.getAlias());
			}else{
				this.allSubAlias.addAll(subList);
			}
		}
		return this.allSubAlias;
	}
	
	public void setDataMemo(String dataMemo) {
		//转成BreezeContext
		BreezeContext dataMemoCtx = ContextTools.getBreezeContext4Json(dataMemo);
		//转换数组成map
		this.dataMemo = new BreezeContext();
		for (int i=0;dataMemoCtx!=null &&i<dataMemoCtx.getArraySize();i++){
			BreezeContext one = dataMemoCtx.getContext(i);
			//处理里面的alias字段并转成BreezeContext
			String key = (String)one.getContext("type").getData();
			String value = (String)one.getContext("desc").getData();
			if ("aliasCfg".equals(key)){
				BreezeContext v = ContextTools.getBreezeContext4Json(value);
				BreezeContext vv = new BreezeContext();
				for (String vName:v.getMapSet()){
					BreezeContext vOne = v.getContext(vName);
					if (vOne.getType() == BreezeContext.TYPE_DATA){
						vv.setContext(vName,vOne);
					}else{
						vv.setContext(vName,new BreezeContext(ContextTools.getJsonString(vOne,null)));
					}
				}
				this.dataMemo.setContext(key,vv);
			}else if("super".equals(key)){//2014-09-04罗光瑜增加对superid的标识
				this.superid = value;
			}else{
				//剩余的是设计部分，这些和流程无关，不写入
				//this.dataMemo.setContext(key,new BreezeContext(value));
			}
			
		}		
	}

	//2014-01-14 罗光瑜增加 权限设定，0,1,2,3,4,5,6,7代表了对内容，节点操作的权限。其中每个下标false标识对应权限没有，不允许操作，否则允许操作
	private boolean[] roleSetting = new boolean[8];

	public String getDataRefresh() {
		return dataRefresh;
	}

	public void setDataRefresh(String dataRefresh) {
		this.dataRefresh = dataRefresh;
	}

	// 外链字段
	private HashMap<String, CMSMetadataField> ourterTableMap;

	public CMSMetadata() {
		this.Children = new ArrayList<CMSMetadata>();
	}

	public CMSMetadata getFather() {
		return father;
	}

	public void setFather(CMSMetadata father) {
		this.father = father;
	}

	public ArrayList<CMSMetadata> getChildren() {
		return Children;
	}

	public void setChildren(ArrayList<CMSMetadata> children) {
		Children = children;
	}

	public int getCid() {
		return cid;
	}

	public void setCid(int ctypeId) {
		this.cid = ctypeId;
	}

	public String getParentAlias() {
		return parentAlias;
	}

	public void setParentAlias(String nodeAlias) {
		this.parentAlias = nodeAlias;
	}

	/**
	 * 2014-09-05罗光瑜修改，支持从父类中获取
	 * @return
	 */
	public String getDataDesc() {
		if (this.dataDescWithFather != null){
			return this.dataDescWithFather;
		}
		if (this.getSuper() == null){
			this.dataDescWithFather = this.dataDesc;
			return this.dataDescWithFather;
		}
		BreezeContext resultCtx = this.getFatherDataDesc();
		return ContextTools.getJsonString(resultCtx, null);
	}
	
	public BreezeContext getFatherDataDesc(){
		BreezeContext result = null;
		if (this.getSuper() != null){
			result = this.getSuper().getFatherDataDesc();
		}
		if (result != null){
			BreezeContext my = ContextTools.getBreezeContext4Json(this.dataDesc);
			for (String n : my.getMapSet()){
				result.setContext(n, my.getContext(n));
			}
		}else{
			result = ContextTools.getBreezeContext4Json(this.dataDesc);
		}
		return result;
	}

	public void setDataDesc(String dataDesc) {
		this.dataDesc = dataDesc;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public String getTableName() {
		return tableName;
	}

	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

	public String getShowName() {
		return showName;
	}

	public void setShowName(String showName) {
		this.showName = showName;
	}

	public boolean isViewNeede() {
		return viewNeede;
	}

	public void setViewNeede(boolean viewNeede) {
		this.viewNeede = viewNeede;
	}

	public boolean[] getRoleSetting() {
		return roleSetting;
	}
	
	

	/**
	 * 设置权限输入，输入的是一个json字符串，例如[1,4]字符串内容标示允许权限的内容
	 * @param roleSetting
	 */
	public void setRoleSetting(String roleSettingStr) {
		//+初始化权限数据，即全部变成null
		for (int i=0;i<8;i++){
			this.roleSetting[i] = false;
		}
		if (roleSettingStr == null){
			return; 
		}
		//+用split分解内容
		String[] sT = roleSettingStr.split("[\\[\\],]");
		//+循环设置
		for (int i=0;i<sT.length;i++){
			if ("".equals(sT[i])){
				continue;
			}
			sT[i] = sT[i].replaceAll("[\"']", "");
			int idx = Integer.parseInt(sT[i]);
			this.roleSetting[idx] = true;
		}
	}

	/**
	 * @return the dataOwner
	 */
	public BTLExecutor[] getDataOwner() {
		return dataOwner;
	}

	/**
	 * @param dataOwner
	 *            the dataOwner to set
	 */
	public void setDataOwner(String dataOwner) {
		if (dataOwner != null && "".equals(dataOwner.trim())) {
			this.dataOwner = null;
			return;
		}
		if (dataOwner == null) {
			this.dataOwner = null;
			return;
		}
		String[] dataOwnerStr = dataOwner.split("\\|");
		if (dataOwnerStr.length==0){
			return;
		}
		this.dataOwner =  new BTLExecutor[dataOwnerStr.length];
		for (int i=0;i<dataOwnerStr.length;i++){
			if ("".equals(dataOwnerStr[i])){
				continue;
			}
			
			this.dataOwner[i] = BTLParser.INSTANCE("cms").parser(dataOwnerStr[i]);
		}
		if (this.dataOwner[1] == null){
			this.dataOwner[1] = this.dataOwner[0];
		}
	}

	public String getOutAlias() {
		return outAlias;
	}

	public void setOutAlias(String outAlias) {
		this.outAlias = outAlias;
	}

	/**
	 * @return the fieldMap
	 */
	public HashMap<String, CMSMetadataField> getFieldMap() {
		return fieldMap;
	}

	public void parserTableFieldByDesc() {
		//2014-09-04罗光瑜修改，首先要避免重复设置
		if(this.fieldMap !=null){
			return;
		}
		this.ourterTableMap = new HashMap<String, CMSMetadataField>();
		this.fieldMap = new HashMap<String, CMSMetadataField>();
		if (this.dataDesc == null) {
			return;
		}
		Map<String, Object> descMap = null;
		try {
			descMap = GsonTools.parserJsonMapObj(dataDesc);// 这将解析成一个HashMap<String,Object>对象Object可能是HashMap可能是ArrayList也或者是普通类型
		} catch (Exception e) {
			
			return;
		}
		if (descMap == null) {
			log.severe("paser json is null");
			return;
		}
		// 处理固定字段
		//如果是cid字段要强制加上isLIst字段
		CMSMetadataField cidField = new CMSMetadataField(this.alias, "cid", "int",
				11, "auto_increment");
		cidField.setAliasField(this.tableName +".cid");
		cidField.setList(true);
		this.fieldMap.put("cid", cidField);
		
		CMSMetadataField aliasField = new CMSMetadataField(this.alias, "alias","varchar", 128);
		aliasField.setAliasField(this.tableName + ".alias");
		this.fieldMap.put("alias", aliasField);
		aliasField.setList(true);
		
		CMSMetadataField nodeidField = new CMSMetadataField(this.alias, "nodeid","int", 11);
		nodeidField.setAliasField(this.tableName + ".nodeid");
		this.fieldMap.put("nodeid", nodeidField);
		
		CMSMetadataField opertimeField = new CMSMetadataField(this.alias,"opertime", "bigint", 20);
		opertimeField.setAliasField(this.tableName +".opertime");
		this.fieldMap.put("opertime", opertimeField);
		
		CMSMetadataField dataOwnerField = new CMSMetadataField(this.alias,"dataOwner", "varchar", 1024);
		dataOwnerField.setAliasField(this.tableName + ".dataOwner");
		this.fieldMap.put("dataOwner", dataOwnerField);
		
		//2015年10月22日11:11:29 FrankCheng 如果是channel那么添加多表信息
		if(this.alias.equals("channel")){
			CMSMetadataField isMuliTab = new CMSMetadataField(this.alias, "isMuliTab", "varchar", 64);
			isMuliTab.setAliasField(this.tableName + ".isMuliTab");
			this.fieldMap.put("isMuliTab", isMuliTab);
			//2015年11月3日17:16:30 FrankCheng 添加表单校验
			CMSMetadataField checkField = new CMSMetadataField(this.alias, "checkField", "varchar", 1024);
			checkField.setAliasField(this.tableName + ".checkField");
			this.fieldMap.put("checkField", checkField);
		}
		
		
		// 2013-10-15罗光瑜修改：判断是否需要视图
		boolean hasOurterKey = false;
		boolean moreThanOneOurter = false;
		log.fine("descMap is:"+descMap);
		for (String fieldName : descMap.keySet()) {
			log.fine("now get field:"+fieldName);
			Map<String, Object> fValue = (Map<String, Object>) descMap
					.get(fieldName);
			// 先处理outerLink
			String ourterField = null;
			String ourterAlias = null;
			if (fValue.get("ourterLink") != null && !"".equals(fValue.get("ourterLink"))) {
				ourterField = fValue.get("ourterLink").toString();
				String[] dd = ourterField.split("\\.");
				if (dd.length == 2) {
					ourterAlias = dd[0];
				} else {
					ourterField = null;
				}
			}

			if ("cid".equals(fieldName) || "alias".equals(fieldName)
					|| "nodeid".equals(fieldName)
					|| "opertime".equals(fieldName)
					|| "dataOwner".equals(fieldName)) {

				CMSMetadataField one = this.fieldMap.get(fieldName);
				if (one != null) {
					if (ourterField == null) {
						one.setAliasField(this.getTableName() + '.' + fieldName);
					} else {
						one.setAliasField(ourterField);
						if (CMSMetadataField.OURTERFIELDNAME.equals(one
								.getFieldType())) {
							String errMsg = "field " + one.getFieldName()
									+ "cannot be "
									+ CMSMetadataField.OURTERFIELDNAME;
							log.severe(errMsg);
							throw new RuntimeException(errMsg);
						} else {
							one.setBuildType(CMSMetadataField.BUILDTYPE_OURTERKEY);
							hasOurterKey = true;
							this.ourterTableMap.put(ourterAlias, one);
						}
					}
					//处理list信息
					boolean isList = "1".equals(fValue.get("islist"));
					one.setList(isList);
				}
				continue;
			}
			String type = "varchar";
			int length = 256;
			if (fValue.get("fieldType") != null && !"".equals(fValue.get("fieldType"))) {
				type = fValue.get("fieldType").toString();
			}

			// 设定不同的长度的默认值
			if (fValue.get("fieldLen") != null && !"".equals(fValue.get("fieldLen").toString())) {
				length = Integer.parseInt(fValue.get("fieldLen").toString());
			} else {
				if ("varchar".equals(type)) {
					length = 256;
				} else if ("int".equals(type)) {
					length = 11;
				} else {
					length = 20;
				}
			}

			Object extDataObj = fValue.get("dataExt");// dataExt.
			String extData = null;
			if (extDataObj != null && !"".equals(fValue.get("dataExt"))) {
				extData = extDataObj.toString();
			}
			CMSMetadataField one = new CMSMetadataField(fieldName, type, length, extData);
			one.setAlias(this.alias);
			//2014-09-29罗光瑜增加客户端类型
			String clientType = fValue.get("type").toString();
			one.setClientType(clientType);
			
			if (ourterField == null) {
				one.setAliasField(this.getTableName() + '.' + fieldName);
			} else {
				one.setAliasField(ourterField);
				if (CMSMetadataField.OURTERFIELDNAME.equals(type)) {
					one.setBuildType(CMSMetadataField.BUILDTYPE_OURTER);
				} else {
					one.setBuildType(CMSMetadataField.BUILDTYPE_OURTERKEY);
					this.ourterTableMap.put(ourterAlias, one);
				}
			}

			// 和页面核对，确认是否是列表显示内容
			boolean isList = "1".equals(fValue.get("islist"));
			one.setList(isList);

			// 设置字段解析模板,字段解析模板的名称也是fieldTmp
			Object fieldTmp = fValue.get("fieldtmp");
			if (fieldTmp != null && !"".equals(fieldTmp) && fieldTmp.toString().indexOf("$")!=-1) {
				one.setFieldTmp(BTLParser.INSTANCE("cms").parser(
						fieldTmp.toString()));
			}
			this.fieldMap.put(fieldName, one);
			// 2013-10-15以此来判断是否需要增加视图
			if (one.getBuildType() == CMSMetadataField.BUILDTYPE_OURTERKEY) {
				hasOurterKey = true;
			}
			if (one.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
				moreThanOneOurter = true;
			}
		}
		if (hasOurterKey && moreThanOneOurter) {
			this.viewNeede = true;
		}
		//2014-09-04罗光瑜增加，这里开始做继承处理，主要是递归调用，让父亲的字段和儿子的字段进行融合
		CMSMetadata s = this.getSuper();
		if (s != null){
			//先让父亲的数据弄好
			s.parserTableFieldByDesc();
			//如果父亲有外链，儿子也要有
			if (s.isViewNeede()){
				this.viewNeede = true;
			}
			//将父亲的数据拷贝下来
			HashMap<String,CMSMetadataField> mf = s.getFieldMap();
			for (String n:mf.keySet()){
				CMSMetadataField my = this.fieldMap.get(n);
				CMSMetadataField sup =  mf.get(n);
				if (my == null){
					this.fieldMap.put(n, sup);
				}else{
					//如果是重复字段，那么儿子的数据库操作必须和父亲一致
					my.setBuildType(sup.getBuildType());
					my.setFieldType(sup.getFieldType());
					my.setSize(sup.getSize());
					my.setExtra(sup.getExtra());
				}
			}
			
			mf = s.getOurterTableMap();
			for (String n:mf.keySet()){
				if (this.ourterTableMap.get(n) == null){
					this.ourterTableMap.put(n, mf.get(n));
				}
			}
			//现在反过来放
			mf = this.fieldMap;
			for (String n:mf.keySet()){
				if (s.getFieldMap().get(n) == null){
					s.getFieldMap().put(n, mf.get(n));
				}
			}
			mf = this.ourterTableMap;
			for (String n:mf.keySet()){
				if (s.getOurterTableMap().get(n) == null){
					s.getOurterTableMap().put(n, mf.get(n));
				}
			}
		}
	}

	/**
	 * @return the ourterTableSet
	 */
	public HashMap<String, CMSMetadataField> getOurterTableMap() {
		return ourterTableMap;
	}	
	
	public BreezeContext getOtherChild() {
		return otherChild;
	}

	public void setOtherChild(BreezeContext otherChild) {
		this.otherChild = otherChild;
	}

	/**
	 * @return
	 */
	public int parserTableFieldByTablename() {
		this.fieldMap = new HashMap<String, CMSMetadataField>();
		try {
			String sql = "desc " + this.tableName;
			ResultSet rs = COMMDB.executeSql(sql);
			while (rs.next()) {
				String fieldName = rs.getString("Field");
				String type = rs.getString("Type");
				int size = 0;
				Pattern p = Pattern.compile("([^\\(]+)\\((\\d+)\\)");
				Matcher m = p.matcher(type);
				if (m.find()) {
					type = m.group(1);
					size = Integer.parseInt(m.group(2));
				}
				String extra = rs.getString("extra");
				this.fieldMap.put(fieldName, new CMSMetadataField(fieldName,
						type, size, extra));
			}
			rs.close();
			return 0;
		} catch (Exception e) {
			return 10;
		}
	}
	
	public boolean equals(Object o){
		try{
			CMSMetadata mm = (CMSMetadata)o;
			return mm.cid == this.cid;
		}catch(Exception e){
			return false;
		}
	}
	public int hashCode(){
		return this.cid;
	}
	
}
