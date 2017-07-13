package com.breezefw.service;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.TimerTask;

import com.breeze.base.log.Logger;
import com.breeze.framwork.netserver.FunctionInvokePoint;
import com.breeze.framwork.netserver.timing.BreezeTimingMgr;
import com.breeze.init.SchedulerIF;
import com.breeze.support.cfg.Cfg;
import com.breeze.support.tools.FileTools;

public class TimingDoServer extends TimerTask implements SchedulerIF {
	private Logger log = Logger
			.getLogger("com.breezefw.framework.init.service.Scheduler");
	@Override
	public long getPeriod() {
		// 30秒执行一次
		return 30*1000;
	}

	@Override
	public TimerTask getTask() {
		return this;
	}

	@Override
	public void run() {
		ArrayList<String> serviceArr = BreezeTimingMgr.INSTANCE.getTiming(3);
		String src = Cfg.getCfg().getRootDir() + "/WEB-INF/scheduler.txt";
		everyDayEvent(src,serviceArr);
	}
	
	public void everyDayEvent(String src, ArrayList<String> serviceArr){
		//获取当前时间单位秒
		long curTime = System.currentTimeMillis();
		//创建一个文件，用来存放定时器最近更新时间
		File filename = new File(src);
		//如果文件不存在就新建一个
		if (!filename.exists()) {
            try {
				filename.createNewFile();
			} catch (IOException e) {
				
			}
            log.info(filename + "已创建！");
            log.info( "file content:"+(curTime-60*60*1000));
            FileTools.writeFile(filename, "" + (curTime-60*60*1000), "utf8");
        }
		//读取文件内容
		String content = FileTools.readFile(filename, "utf8");
		log.info(filename + "已存在！");
		log.info( "file content:"+content);
		//把文件内容转为long类型
		long upTime = Long.parseLong(content);
		
		Date cud=new Date(curTime);
		
		DateFormat df= new SimpleDateFormat("hh");
		int curMin = Integer.parseInt(df.format(cud));
		long curHours = (curTime-upTime)/1000/60/60;
		
        if(curMin>=3 && curMin<=5 && curHours>23 ){
        	log.info("begin doServer.");
        	if(serviceArr!=null){
				for(int i=0;i<serviceArr.size();i++){
					log.info("service:"+serviceArr.get(i));
					FunctionInvokePoint.getInc().breezeInvokeUsedCtxAsParam(serviceArr.get(i), null);
				}
			}
			log.info("doServer success!");
        	FileTools.writeFile(filename, "" + curTime, "utf8");
        }
        log.info("当前小时:" +curMin + ",距离上次更新时间：" + curHours);
	}

}
