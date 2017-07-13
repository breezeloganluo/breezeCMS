package com.breezefw.service.cms;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.JedisShardInfo;
import redis.clients.jedis.ShardedJedis;
import redis.clients.jedis.ShardedJedisPool;

public class RedisUtil {
	
	private int port = 6379;
	private List<JedisShardInfo> shards;
	private ShardedJedis sharding;
	private ShardedJedisPool pool;
	
	private RedisUtil(){
		
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月6日17:55:01
	 * @param address REDIS服务器地址 可以为数组
	 * @param port REDIS服务器端口
	 * */
	public RedisUtil(int port,String ... address){
		init(port, address);
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月6日17:58:49
	 * @param address REDIS服务器地址 可以为数组
	 * */
	public RedisUtil(String ... address){
		init(port, address);
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月6日18:26:11
	 * @param port 端口 
	 * @param address REDIS服务器地址
	 * */
	private void init(int port,String ... address){
		shards = new ArrayList<JedisShardInfo>();
		for(int i=0;i<address.length;i++){
			shards.add(new JedisShardInfo(address[i], port));
		}
		pool = new ShardedJedisPool(new JedisPoolConfig(), shards);		
		sharding = pool.getResource();
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月7日12:14:47
	 * @param key 键
	 * @param value 值
	 * */
	public void setValue(String key,String value){
		if(value == null){
			value = "nullObj";
		}
		sharding.set(key, value);
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年2月25日15:07:40
	 * @param key 键
	 * @param value 值(数组)
	 * */
	public void setValue(String key,String[] value){
		if(value == null){
			value = new String[]{null};
		}else{
			sharding.sadd(key, value);
		}
	}
	
	/**
	 * @author FrankCheng
	 * @data 2015年2月7日12:15:21
	 * @param key 键
	 * */
	public String getValue(String key){
		String value = sharding.get(key);
		if(value != null && value.equals("nullObj")){
			value = null;
		}
		return value;
	}
	
	public Set<String> getSet(String key){
		if(sharding.scard(key) == 0){
			return null;
		}else{
			return sharding.smembers(key);
		}
	}

	public static void main(String[] args) {
		RedisUtil rt = new RedisUtil(new String[]{"192.168.1.82","192.168.1.83"});
		rt.setValue("1", "2");
		System.out.println(rt.getValue("1"));
	}
}
