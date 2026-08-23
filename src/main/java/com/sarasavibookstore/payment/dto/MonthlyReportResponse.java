package com.sarasavibookstore.payment.dto;

import java.math.BigDecimal;

public class MonthlyReportResponse {

    private int year;
    private int month;
    private BigDecimal totalPaidAmount;
    private long paidCount;
    private long failedCount;
    private long refundedCount;
    private long pendingCount;

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public BigDecimal getTotalPaidAmount() { return totalPaidAmount; }
    public void setTotalPaidAmount(BigDecimal totalPaidAmount) { this.totalPaidAmount = totalPaidAmount; }

    public long getPaidCount() { return paidCount; }
    public void setPaidCount(long paidCount) { this.paidCount = paidCount; }

    public long getFailedCount() { return failedCount; }
    public void setFailedCount(long failedCount) { this.failedCount = failedCount; }

    public long getRefundedCount() { return refundedCount; }
    public void setRefundedCount(long refundedCount) { this.refundedCount = refundedCount; }

    public long getPendingCount() { return pendingCount; }
    public void setPendingCount(long pendingCount) { this.pendingCount = pendingCount; }
}
