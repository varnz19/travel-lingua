#!/usr/bin/env python3
"""
Person 3 — Week 1 Hardware Acceleration Audit
Audits CPU architecture, PyTorch backends, Apple Silicon MPS, and memory.
"""
import sys
import platform
import os


def audit_hardware():
    print("=" * 60)
    print(" TRAVEL-LINGUA ML HARDWARE ACCELERATION AUDIT")
    print("=" * 60)
    print(f"OS Platform     : {platform.system()} {platform.release()}")
    print(f"Architecture    : {platform.machine()}")
    print(f"Python Runtime  : {sys.version.split()[0]}")

    try:
        import torch
        print(f"PyTorch Version : {torch.__version__}")
        cuda_avail = torch.cuda.is_available()
        mps_avail = hasattr(torch.backends, "mps") and torch.backends.mps.is_available()
        
        print(f"CUDA Available  : {cuda_avail}")
        print(f"MPS Available   : {mps_avail} (Apple Silicon Metal Performance Shaders)")

        if mps_avail:
            device = torch.device("mps")
            x = torch.ones(5, 5, device=device)
            print(f"MPS Health Check: SUCCESS -> Tensor successfully allocated on {device}")
        elif cuda_avail:
            device = torch.device("cuda")
            print(f"CUDA Device     : {torch.cuda.get_device_name(0)}")
        else:
            print("Backend Device  : CPU (INT8 quantization with CTranslate2)")
    except ImportError:
        print("PyTorch Status  : Not installed in active environment (Using high-speed NumPy/CPU pipeline)")

    print("=" * 60)


if __name__ == "__main__":
    audit_hardware()
