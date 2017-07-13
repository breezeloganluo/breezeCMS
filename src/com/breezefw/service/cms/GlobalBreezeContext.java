package com.breezefw.service.cms;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.breeze.framwork.databus.BreezeContext;

public class GlobalBreezeContext extends BreezeContext {
	
	private static String PATH;
	private static String ARRAYPATH;
	private BreezeContext breezeContext;
	
	private RedisUtil rt;
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:22:16 
	 * @param rt RedisUtil实例
	 * @explain set方法
	 * */
	public void setRt(RedisUtil rt) {
		this.rt = rt;
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:21:10
	 * @return GlobalBreezeContext
	 * @param rt RedisUtil实例
	 * @explain 带参构造方法
	 * */
	public GlobalBreezeContext(RedisUtil rt) {
		this.rt = rt;
		this.breezeContext = new BreezeContext();
	}
	
	private GlobalBreezeContext(RedisUtil rt,BreezeContext breezeContext) {
		this.rt = rt;
		this.breezeContext = breezeContext;
	}
	
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:20:28 
	 * @return Object
	 * @explain 获取真正数据 
	 * */
	@Override
	public Object getData() {
		Object result = null;
		if(ARRAYPATH == null){
			result = rt.getValue(PATH);
		}else{
			result = rt.getValue(ARRAYPATH);
		}
		PATH = null;
		ARRAYPATH = null;
		return result;
	}

	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:19:18 
	 * @return GlobalBreezeContext
	 * @param idx 数组key值
	 * @explain get方法
	 * */
	public GlobalBreezeContext getContext(int idx) {
		ARRAYPATH = PATH + "[" + idx + "]";
		return new GlobalBreezeContext(this.rt,this.breezeContext);
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:19:18 
	 * @return GlobalBreezeContext
	 * @param pname key值
	 * @explain get方法
	 * */
	public GlobalBreezeContext getContext(String pname) {
		if (PATH == null) {
			PATH = pname;
		} else {
			PATH += "." + pname;
		}
		return new GlobalBreezeContext(this.rt,this.breezeContext);
	}

	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:17:38
	 * @return Set
	 * @explain 获取map值
	 * */
	@Override
	public Set<String> getMapSet() {
		String _path = PATH;
		PATH = null;
		if(_path == null){
			return rt.getSet("DirKey");
		}else{
			return rt.getSet(_path + "_key");
		}
	}

	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:16:13
	 * @param idx 数组类型的key值
	 * @param pvalue value值
	 * @explain 设置数据到Reius中
	 * */
	@Override
	public void setContext(int idx, BreezeContext pvalue) {
		rt.setValue(PATH + "[" + idx + "]", pvalue.getData().toString());
		saveMapKeys();
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:14:53 FrankCheng
	 * @param pname key值
	 * @param pvalue value值
	 * @explain 设置数据到Redis中
	 * */
	@Override
	public void setContext(String pname, BreezeContext pvalue) {
		PATH = PATH == null ? pname : (PATH + "." + pname);
		breezeContext.setContextByPath(PATH, pvalue);
		if(breezeContext.getContextByPath(PATH).getType() == TYPE_ARRAY){
			for(int i=0;i<pvalue.getArraySize();i++){
				setContext(i, pvalue.getContext(i));
			}
		}else if(breezeContext.getContextByPath(PATH).getType() == TYPE_DATA){
			rt.setValue(PATH, pvalue.getData().toString());
			saveMapKeys();
		}else if(breezeContext.getContextByPath(PATH).getType() == TYPE_MAP){
			String[] keys = pvalue.getMapSet().toArray(new String[pvalue.getMapSet().size()]);
			rt.setValue(PATH + "_key", keys);
			for(String key : keys){
				setContext(key, pvalue.getContext(key));
			}
		}
		PATH = null;
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年3月2日11:04:50
	 * @return boolean
	 * @exception 判断是否为空
	 * */
	@Override
	public boolean isNull() {
		if(PATH == null){
			if(rt.getSet("DirKey") != null){
				return false;
			}else if(rt.getValue("DirKey") == null){
				PATH = null;
				return true;
			}else{
				return false;
			}
		}else{
			if(rt.getSet(PATH) != null){
				return false;
			}else if(rt.getValue(PATH) == null){
				PATH = null;
				return true;
			}else{
				return false;
			}
		}
	}

	/**
	 * @author FrankCheng
	 * @date 2015年2月27日18:12:26
	 * @explain 遍历所有可能 赋值MAPSET
	 * */
	private void saveMapKeys(){
		String[] nulStr = null;
		String[] names = PATH.split("\\.");
		Pattern p = Pattern.compile("([^\\[\\]]+)\\[(\\d*)\\]$");
		String pName = null;
		for(int i=0;i<names.length;i++){
			String name = names[i];
			Matcher m = p.matcher(name);
			if(m.find()){
				pName = pName == null ? name : pName + "." + m.group(1);
				if(breezeContext.getContextByPath(pName).getType() == TYPE_ARRAY){
					rt.setValue(pName + "_key", nulStr);
				}
				pName += "[" + m.group(2) + "]";
			}else{
				pName = pName == null ? name : pName + "." + name;
				if(breezeContext.getContextByPath(pName).getType() == TYPE_MAP){
					String[] keys = breezeContext.getContextByPath(pName).getMapSet().toArray(new String[breezeContext.getContextByPath(pName).getMapSet().size()]);
					rt.setValue(pName + "_key", keys);
				}else{
					rt.setValue(pName + "_key", nulStr);
				}
			}
		}
		if(breezeContext.getMapSet() != null){
			String[] keys = breezeContext.getMapSet().toArray(new String[breezeContext.getMapSet().size()]);
			rt.setValue("DirKey", keys);
		}
	}
}
