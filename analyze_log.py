#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Nginx访问日志分析脚本
分析正常访问数量并对访问来源进行分类
"""

import re
from collections import defaultdict
from datetime import datetime

def parse_log_line(line):
    """解析nginx日志行"""
    # 跳过命令提示符行
    if line.startswith('ubuntu@') or line.startswith('$'):
        return None
    
    # nginx日志格式: IP - - [时间] "方法 路径 HTTP版本" 状态码 大小 "Referer" "User-Agent"
    pattern = r'(\S+) - - \[([^\]]+)\] "(\S+) (\S+) ([^"]+)" (\d+) (\S+) "([^"]*)" "([^"]*)"'
    match = re.match(pattern, line)
    
    if not match:
        return None
    
    ip = match.group(1)
    timestamp = match.group(2)
    method = match.group(3)
    path = match.group(4)
    http_version = match.group(5)
    status_code = int(match.group(6))
    size = match.group(7)
    referer = match.group(8)
    user_agent = match.group(9)
    
    return {
        'ip': ip,
        'timestamp': timestamp,
        'method': method,
        'path': path,
        'status_code': status_code,
        'size': size,
        'referer': referer,
        'user_agent': user_agent
    }

def classify_visitor(user_agent, path, status_code, method):
    """对访问者进行分类"""
    if not user_agent:
        user_agent = ''
    ua_lower = user_agent.lower()
    
    # 搜索引擎爬虫
    if 'googlebot' in ua_lower:
        return '搜索引擎爬虫 - Google'
    if 'bingbot' in ua_lower:
        return '搜索引擎爬虫 - Bing'
    if 'ahrefsbot' in ua_lower:
        return '搜索引擎爬虫 - Ahrefs'
    if 'amazonbot' in ua_lower:
        return '搜索引擎爬虫 - Amazon'
    if '360spider' in ua_lower or '360Spider' in user_agent:
        return '搜索引擎爬虫 - 360'
    
    # 社交媒体爬虫
    if 'twitterbot' in ua_lower:
        return '社交媒体爬虫 - Twitter'
    if 'meta-externalagent' in ua_lower or 'facebook' in ua_lower:
        return '社交媒体爬虫 - Facebook'
    
    # AI/工具爬虫
    if 'gptbot' in ua_lower:
        return 'AI爬虫 - GPTBot'
    if 'headlesschrome' in ua_lower:
        return '自动化工具 - HeadlessChrome'
    
    # 安全扫描工具
    if 'censysinspect' in ua_lower:
        return '安全扫描 - Censys'
    if 'palo alto' in ua_lower or 'cortex-xpanse' in ua_lower:
        return '安全扫描 - Palo Alto'
    if 'internetmeasurement' in ua_lower:
        return '安全扫描 - InternetMeasurement'
    
    # 其他工具
    if 'curl' in ua_lower:
        return '工具 - curl'
    if 'python-requests' in ua_lower:
        return '工具 - Python requests'
    if 'go-http-client' in ua_lower:
        return '工具 - Go HTTP Client'
    if 'kiroide' in ua_lower:
        return '工具 - KiroIDE'
    if 'dalvik' in ua_lower:
        return '工具 - Android Dalvik'
    
    # 扫描/攻击行为（需要检查路径和方法）
    if status_code in [400, 404, 405, 444, 499]:
        # 检查可疑路径
        suspicious_paths = [
            '/cgi-bin', '/geoserver', '/wfs', '/ows', 
            '/+CSCOL+', '/+CSCOE+', '/ecp/', '/developmentserver',
            '/ab2g', '/ab2h', '/alive.php', '/teorema505',
            'zgrab', 'mstshash', 'MGLNDD'
        ]
        if any(sp in path for sp in suspicious_paths) or 'zgrab' in ua_lower:
            return '扫描/攻击 - 可疑路径扫描'
        if method in ['POST', 'OPTIONS', 'PROPFIND'] and status_code != 200:
            return '扫描/攻击 - 异常请求方法'
        if status_code == 400 and path == '/':
            return '扫描/攻击 - 恶意请求'
        # 其他4xx/5xx错误
        return '异常访问 - HTTP错误'
    
    # 正常用户（浏览器）
    if any(browser in ua_lower for browser in ['chrome', 'firefox', 'safari', 'edge', 'opera']):
        if status_code in [200, 304, 301, 308]:
            return '正常用户 - 浏览器访问'
        else:
            return '正常用户 - 错误请求'
    
    # 未分类
    if status_code in [200, 304, 301, 308]:
        return '其他 - 正常访问'
    else:
        return '其他 - 异常访问'

def analyze_log(file_path):
    """分析日志文件"""
    stats = {
        'total': 0,
        'normal': 0,
        'categories': defaultdict(int),
        'status_codes': defaultdict(int),
        'ips': defaultdict(int)
    }
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            parsed = parse_log_line(line)
            if not parsed:
                continue
            
            stats['total'] += 1
            stats['status_codes'][parsed['status_code']] += 1
            stats['ips'][parsed['ip']] += 1
            
            # 判断是否正常访问（状态码200、304、301、308）
            if parsed['status_code'] in [200, 304, 301, 308]:
                stats['normal'] += 1
            
            # 分类
            category = classify_visitor(
                parsed['user_agent'],
                parsed['path'],
                parsed['status_code'],
                parsed['method']
            )
            stats['categories'][category] += 1
    
    return stats

def print_report(stats):
    """打印分析报告"""
    print("=" * 80)
    print("Nginx访问日志分析报告")
    print("=" * 80)
    print()
    
    print(f"总访问次数: {stats['total']}")
    print(f"正常访问次数: {stats['normal']} ({stats['normal']/stats['total']*100:.2f}%)")
    print(f"异常访问次数: {stats['total'] - stats['normal']} ({(stats['total'] - stats['normal'])/stats['total']*100:.2f}%)")
    print()
    
    print("-" * 80)
    print("访问来源分类统计:")
    print("-" * 80)
    for category, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
        percentage = count / stats['total'] * 100
        print(f"  {category:40s} {count:5d} ({percentage:5.2f}%)")
    print()
    
    print("-" * 80)
    print("HTTP状态码统计:")
    print("-" * 80)
    for status, count in sorted(stats['status_codes'].items()):
        percentage = count / stats['total'] * 100
        status_name = {
            200: '200 OK',
            304: '304 Not Modified',
            301: '301 Moved Permanently',
            308: '308 Permanent Redirect',
            400: '400 Bad Request',
            404: '404 Not Found',
            405: '405 Method Not Allowed',
            444: '444 Connection Closed',
            499: '499 Client Closed Request'
        }.get(status, str(status))
        print(f"  {status_name:30s} {count:5d} ({percentage:5.2f}%)")
    print()
    
    print("-" * 80)
    print("访问最多的IP地址 (Top 10):")
    print("-" * 80)
    for ip, count in sorted(stats['ips'].items(), key=lambda x: x[1], reverse=True)[:10]:
        percentage = count / stats['total'] * 100
        print(f"  {ip:20s} {count:5d} ({percentage:5.2f}%)")
    print()

if __name__ == '__main__':
    log_file = r'c:\Users\kingdee\Desktop\日志.txt'
    report_file = 'log_analysis_report.txt'
    
    print("正在分析日志文件...")
    stats = analyze_log(log_file)
    
    # 打印到控制台
    print_report(stats)
    
    # 同时保存到文件
    import sys
    with open(report_file, 'w', encoding='utf-8') as f:
        original_stdout = sys.stdout
        sys.stdout = f
        print_report(stats)
        sys.stdout = original_stdout
    
    print(f"\n分析报告已保存到: {report_file}")

