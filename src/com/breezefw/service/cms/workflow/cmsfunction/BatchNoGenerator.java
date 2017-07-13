package com.breezefw.service.cms.workflow.cmsfunction;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;

public class BatchNoGenerator extends CMSBTLFunctionAbs {
	private Logger log = Logger.getLogger("com.breezefw.service.cms.workflow.cmsfunction.BatchNoGenerator");
	private static HashMap<String,Object>lockMap = new HashMap<String,Object>(); 
	private static HashMap<String,Integer>snMap = new HashMap<String,Integer>();
	private static Object allLock = new Object();
	
	/**
	 * 页面使用方式：${#BNO(name,s)}
	 * name是当前需要的批次前缀，
	 * s是中间的从BreezeContext中获取的参数
	 * 批次号的生成规则是：
	 * [name][ctx{s}]yyyymmdd[sn(4)]即6位的流水号
	 */
	@Override
	protected String fun(String funParam, Object[] evenenvironment,
			ArrayList<Object> output) {
		String[] ps = funParam.split(",");
		String preStr = ps[0];
		//将模式固定好
		SimpleDateFormat sdf = new SimpleDateFormat("yyMMddHH");
		StringBuilder sb = new StringBuilder();
		sb.append(preStr);
		//处理第二个参数
		if (ps.length>1 && evenenvironment!=null){
			BreezeContext root = (BreezeContext) (evenenvironment[0]);
			BreezeContext sndCtx =  root.getContextByPath(ps[1]);
			sb.append(sndCtx);
		}
		sb.append(sdf.format(new Date()));
		//处理同步锁问题
		Object lock = lockMap.get(preStr);
		if (lock == null){
			synchronized(allLock){
				lock = lockMap.get(preStr);
				if (lock == null){
					lock = new Object();
					lockMap.put(preStr, lock);
					snMap.put(preStr, 0);
				}
			}
		}
		//按照返回来的锁对象进行枷锁
		synchronized(lock){
			int sn = 0;
			if (snMap.get(preStr) != null){
				sn = snMap.get(preStr);
			}
			sn=(sn+1) % 10000;
			snMap.put(preStr, sn);
			sb.append(String.format("%1$04d", sn));
		}
		//输出结果		
		return sb.toString();
	}

	@Override
	protected String getName() {		
		return "BNO";
	}
	
	public static void main(String[] args){
		BreezeContext rr = new BreezeContext();
		rr.setContextByPath("a.b", new BreezeContext("O"));
		BatchNoGenerator test = new BatchNoGenerator();	
		Object[]po = new Object[]{rr};
		for (int i=0;i<1000;i++){
			ArrayList p = new ArrayList();
			test.fun("W,a.bc", po, p);
			System.out.println(p.get(0));
		}
	}

}
