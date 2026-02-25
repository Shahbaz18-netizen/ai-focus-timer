import time
from fastapi import Request, Response

async def log_requests(request: Request, call_next):
    """
    Logs every incoming request to help with debugging.
    Ignores noisy endpoints like /docs.
    """
    start_time = time.time()
    path = request.url.path
    method = request.method
    
    # Skip noisy logs
    if path in ["/openapi.json", "/docs", "/ping", "/"]:
        return await call_next(request)
        
    print(f"--> [REQ] {method} {path}")
    
    # Process the request
    response = await call_next(request)
    
    # Calculate how long the request took
    process_time = (time.time() - start_time) * 1000
    status_code = response.status_code
    
    # Color-code the output: Green for success, Red for errors
    log_color = "\033[92m" if status_code < 400 else "\033[91m"
    reset_color = "\033[0m"
    
    print(f"<-- [RES] {method} {path} | STATUS: {log_color}{status_code}{reset_color} | TIME: {process_time:.2f}ms")
    
    return response
