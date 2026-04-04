---
base_model: microsoft/DialoGPT-medium
library_name: peft
model_name: mental_health_model_v2
tags:
- base_model:adapter:microsoft/DialoGPT-medium
- lora
- sft
- transformers
- trl
licence: license
pipeline_tag: text-generation
---

# Model Card for mental_health_model_v2

This model is a fine-tuned version of [microsoft/DialoGPT-medium](https://huggingface.co/microsoft/DialoGPT-medium).
It has been trained using [TRL](https://github.com/huggingface/trl).

## Quick start

```python
from transformers import pipeline

question = "If you had a time machine, but could only go to the past or the future once and never return, which would you choose and why?"
generator = pipeline("text-generation", model="None", device="cuda")
output = generator([{"role": "user", "content": question}], max_new_tokens=128, return_full_text=False)[0]
print(output["generated_text"])
```

## Training procedure

 



This model was trained with SFT.

### Framework versions

- PEFT 0.17.1
- TRL: 0.29.1
- Transformers: 4.57.6
- Pytorch: 2.12.0.dev20260330+cu128
- Datasets: 4.8.4
- Tokenizers: 0.22.2

## Citations



Cite TRL as:
    
```bibtex
@software{vonwerra2020trl,
  title   = {{TRL: Transformers Reinforcement Learning}},
  author  = {von Werra, Leandro and Belkada, Younes and Tunstall, Lewis and Beeching, Edward and Thrush, Tristan and Lambert, Nathan and Huang, Shengyi and Rasul, Kashif and GallouÃ©dec, Quentin},
  license = {Apache-2.0},
  url     = {https://github.com/huggingface/trl},
  year    = {2020}
}
```