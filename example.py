import time

def measure_time():
    print("👉 [Before yield] Opening stopwatch & starting timer...")
    start_time = time.time()
    
    yield "HERE IS YOUR STOPWATCH HANDLE" 
    
    end_time = time.time()
    duration = end_time - start_time

    yield "also last line of the code"

    print(f"👉 [After yield] Stopping timer! Total time: {duration:.4f} seconds.")

def run_my_code():
    print("--- Code execution started ---")
    
generator = measure_time()

handle = next(generator) 
print(f"Received from generator: {handle}")

run_my_code()
time.sleep(1)

try:
    result = next(generator)
    print(result)
    next(generator)
except StopIteration:
    pass