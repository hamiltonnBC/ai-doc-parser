import time
from typing import Dict, List
from fastapi import HTTPException, Request
from collections import defaultdict, deque
import asyncio

class RateLimiter:
    def __init__(self):
        # Store request timestamps per IP
        self.requests: Dict[str, deque] = defaultdict(lambda: deque())
        # Store daily counters per IP
        self.daily_counters: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        # Store last reset time for daily counters
        self.last_reset: Dict[str, float] = defaultdict(float)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        # Check for forwarded headers first (for reverse proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        return request.client.host if request.client else "unknown"
    
    def _reset_daily_counter_if_needed(self, ip: str):
        """Reset daily counter if it's a new day"""
        current_time = time.time()
        last_reset = self.last_reset.get(ip, 0)
        
        # If more than 24 hours have passed, reset the counter
        if current_time - last_reset > 86400:  # 24 hours in seconds
            self.daily_counters[ip] = defaultdict(int)
            self.last_reset[ip] = current_time
    
    def _cleanup_old_requests(self, ip: str, window_seconds: int):
        """Remove requests older than the time window"""
        current_time = time.time()
        requests = self.requests[ip]
        
        # Remove old requests
        while requests and current_time - requests[0] > window_seconds:
            requests.popleft()
    
    def check_rate_limit(self, request: Request, endpoint: str, 
                        hourly_limit: int, daily_limit: int) -> bool:
        """
        Check if request is within rate limits
        Returns True if allowed, raises HTTPException if not
        """
        ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Reset daily counter if needed
        self._reset_daily_counter_if_needed(ip)
        
        # Check daily limit
        daily_key = f"{endpoint}_daily"
        if self.daily_counters[ip][daily_key] >= daily_limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily limit exceeded. Maximum {daily_limit} requests per day for {endpoint}."
            )
        
        # Check hourly limit
        self._cleanup_old_requests(ip, 3600)  # 1 hour = 3600 seconds
        
        if len(self.requests[ip]) >= hourly_limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {hourly_limit} requests per hour for {endpoint}."
            )
        
        # Add current request
        self.requests[ip].append(current_time)
        self.daily_counters[ip][daily_key] += 1
        
        return True

# Global rate limiter instance
rate_limiter = RateLimiter()