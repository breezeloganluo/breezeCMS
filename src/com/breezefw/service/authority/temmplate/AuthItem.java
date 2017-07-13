package com.breezefw.service.authority.temmplate;

import com.breeze.framwork.servicerg.FieldDesc;
import com.breeze.framwork.servicerg.TemplateItemBase;

public class AuthItem extends TemplateItemBase {
	@FieldDesc(desc = "描述获取角色的全局路径，如果defaultRole和本参数不填表示不进行权限操作", title = "rolePath", valueRange = "")
	private String rolePath;
	
	@FieldDesc(desc = "无权限获取时的默认路径，如果rolePath和本参数不填表示不进行权限操作", title = "defaultRole", valueRange = "")
	private String defaultRole;

	public String getRolePath() {
		return rolePath;
	}

	public void setRolePath(String rolePath) {
		this.rolePath = rolePath;
	}

	public String getDefaultRole() {
		return defaultRole;
	}

	public void setDefaultRole(String defaultRole) {
		this.defaultRole = defaultRole;
	}
	
	
}
