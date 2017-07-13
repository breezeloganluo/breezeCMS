package com.breezefw.service.cms.templateitem;

public class LoanHelpInfo {
	private int progress =0;
	private String status = null;
	private int loanCount = 0;
	private int current =0;
	private int lessInves = 0;
	private int mostInves = 0;
	private int multiple = 0;
	String ctrNo = null;
	
	
	public LoanHelpInfo(int _progress,String _status,int _loanCount){
		this.progress = _progress;
		this.status = _status;
		this.loanCount = _loanCount;
	}
	
	public int getProgress() {
		return progress;
	}
	public void setProgress(int progress) {
		this.progress = progress;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}

	public int getLoanCount() {
		return loanCount;
	}

	public void setLoanCount(int loanCount) {
		this.loanCount = loanCount;
	}

	public int getCurrent() {
		return current;
	}

	public void setCurrent(int current) {
		this.current = current;
	}
	
	public int addInves(int m){
		if (this.current + m > this.loanCount){
			return 35;
		}
		this.current+=m;
		return 0;
	}
	
	public int calProgress(){
		//因为是除法，所以百分百的时候要重新算，其他的无所谓
		if (this.current == this.loanCount){
			this.progress = 100;
			this.status = "满标待审";
			return 100;
		}
		this.progress = (int)(this.current*100/this.loanCount);
		this.status = "招标中";
		return this.progress;
	}

	public int getLessInves() {
		return lessInves;
	}

	public void setLessInves(int lessInves) {
		this.lessInves = lessInves;
	}

	public int getMostInves() {
		return mostInves;
	}

	public void setMostInves(int mostInves) {
		this.mostInves = mostInves;
	}

	public int getMultiple() {
		return multiple;
	}

	public void setMultiple(int multiple) {
		this.multiple = multiple;
	}

	public String getCtrNo() {
		return ctrNo;
	}

	public void setCtrNo(String ctrNo) {
		this.ctrNo = ctrNo;
	}
	
	
}
