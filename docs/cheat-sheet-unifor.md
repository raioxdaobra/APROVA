# Cheat sheet — padrões da banca Unifor Medicina

> Análise estatística sobre **525** questões não-anuladas com alternativas extraídas via OCR (Groq Llama 4 Scout). Geração: 11/05/2026, 05:20:51.

> ⚠ Análise descritiva, não preditiva. Indica tendências, não regras absolutas.


## 1. Comprimento da alternativa (chars)

| | Média | Mínimo | Máximo |
|---|---|---|---|
| Correta (1 por questão) | 53.5 | 1 | 495 |
| Errada (4 por questão) | 51.2 | 1 | 681 |

**Diferença:** correta tem em média **2 chars** a mais que erradas (**+4.5%**).

### Por disciplina

| Disciplina | Correta (chars) | Errada (chars) | Diferença |
|---|---|---|---|
| matematica | 15.1 | 14.8 | +0.3 |
| fisica | 22.1 | 22.9 | -0.8 |
| biologia | 57.7 | 56.3 | +1.4 |
| quimica | 33.6 | 32.6 | +1.0 |
| humanas | 117.5 | 110.6 | +6.9 |
| linguagens | 61.3 | 58.7 | +2.6 |

## 2. Termos absolutos (sempre, nunca, todos, nenhum, exclusivamente, ...)

- Em alternativas **CORRETAS**: 16 ocorrências em 524 alternativas (média **0.03/alt**)
- Em alternativas **ERRADAS**: 88 ocorrências em 2097 alternativas (média **0.04/alt**)
- **Razão errada:correta = 1.37x** — termos absolutos aparecem MAIS em distratores ✓

## 3. Qualificadores (geralmente, pode, tende, costuma, ...)

- Em alternativas **CORRETAS**: 24 ocorrências (média **0.05/alt**)
- Em alternativas **ERRADAS**: 108 ocorrências (média **0.05/alt**)
- **Razão correta:errada = 0.89x** — sem viés claro

## 4. Termos de negação (não, incorreto, exceto, ...)

- Em alternativas **CORRETAS**: 25 ocorrências (média **0.05/alt**)
- Em alternativas **ERRADAS**: 115 ocorrências (média **0.05/alt**)

## 5. Questões com 5 alternativas numéricas

- Total de questões puramente numéricas: **150**
- Posição da resposta correta (ordenando alternativas do menor pro maior):

| Rank | Frequência |
|---|---|
| Menor (1º) | 26 (17.3%) |
| 2º | 24 (16.0%) |
| Mediana (3º) | 40 (26.7%) |
| 4º | 30 (20.0%) |
| Maior (5º) | 30 (20.0%) |

**Tendência:** valor **Mediana (3º)** é o mais comum.

## 6. "Todas/nenhuma das anteriores"

Não detectadas no banco.

## 7. Letra correta mais comum por disciplina

| Disciplina | A | B | C | D | E | Lider |
|---|---|---|---|---|---|---|
| matematica | 18.7% | 19.4% | 21.6% | 24.6% | 15.7% | **D** |
| fisica | 19.0% | 14.3% | 33.3% | 19.0% | 14.3% | **C** |
| biologia | 17.8% | 24.4% | 22.2% | 22.2% | 13.3% | **B** |
| quimica | 16.7% | 11.9% | 31.0% | 19.0% | 21.4% | **C** |
| humanas | 24.4% | 21.1% | 23.3% | 14.4% | 16.7% | **A** |
| linguagens | 18.0% | 18.0% | 25.0% | 16.3% | 22.7% | **C** |

## 8. Análise pedagógica

> Baseado em 161 questões com classificação pedagógica.


### 8.1 Distribuição por nível de Bloom

| Nível | Contagem | % |
|---|---|---|
| lembrar | 0 | 0.0% |
| compreender | 14 | 8.7% |
| aplicar | 65 | 40.4% |
| analisar | 24 | 14.9% |
| avaliar | 58 | 36.0% |
| criar | 0 | 0.0% |

**Dominante:** aplicar (40.4%)

### 8.2 Tipo de questão

| Tipo | Contagem | % |
|---|---|---|
| conceitual | 76 | 47.2% |
| procedural | 58 | 36.0% |
| interpretativo | 27 | 16.8% |

### 8.3 Formato

| Formato | Contagem | % |
|---|---|---|
| interpretacao_texto | 64 | 39.8% |
| caso | 33 | 20.5% |
| imagem | 30 | 18.6% |
| calculo | 12 | 7.5% |
| pergunta_direta | 12 | 7.5% |
| analise_dados | 10 | 6.2% |

### 8.4 Estratégia mais comum dos distratores

| Estratégia | Contagem | % |
|---|---|---|
| troca_conceitos | 98 | 60.9% |
| erro_calculo | 55 | 34.2% |
| concepcao_errada | 4 | 2.5% |
| misto | 3 | 1.9% |
| logica_invertida | 1 | 0.6% |

### 8.5 Complexidade (carga cognitiva)

| Nível | Contagem | % |
|---|---|---|
| 1 | 0 | 0.0% |
| 2 | 43 | 26.7% |
| 3 | 109 | 67.7% |
| 4 | 9 | 5.6% |
| 5 | 0 | 0.0% |

**Média geral:** 2.79 / 5

### 8.6 Complexidade média por disciplina

| Disciplina | n | Média |
|---|---|---|
| quimica | 13 | 3.00 |
| humanas | 29 | 2.97 |
| fisica | 14 | 2.93 |
| matematica | 44 | 2.75 |
| biologia | 15 | 2.73 |
| linguagens | 46 | 2.63 |

### 8.7 Letra correta por nível de Bloom

| Bloom | n | A | B | C | D | E | Líder |
|---|---|---|---|---|---|---|---|
| compreender | 14 | 14.3% | 28.6% | 21.4% | 21.4% | 14.3% | **B** |
| aplicar | 65 | 21.5% | 24.6% | 26.2% | 16.9% | 10.8% | **C** |
| analisar | 24 | 12.5% | 16.7% | 37.5% | 12.5% | 20.8% | **C** |
| avaliar | 58 | 27.6% | 22.4% | 15.5% | 20.7% | 13.8% | **A** |

### 8.8 Letra correta por estratégia de distrator

> Quando os distratores são todos do mesmo tipo, qual letra costuma ser a correta?

| Estratégia | n | Letra mais comum |
|---|---|---|
| troca_conceitos | 98 | **B** (24.5%) |
| erro_calculo | 55 | **C** (32.7%) |
| concepcao_errada | 4 | **B** (50.0%) |
| misto | 3 | **A** (33.3%) |
| logica_invertida | 1 | **C** (100.0%) |

## 🎯 Cheat sheet final

Se precisar chutar, em ordem de prioridade:

1. **Olhe os termos absolutos.** Alternativas com "sempre", "nunca", "todos", "nenhum", "exclusivamente" tendem a ser distratores. Elimine elas primeiro.
2. **Olhe os qualificadores.** Alternativas com "geralmente", "tende a", "pode", "na maioria dos casos" tendem a ser corretas. Foque nelas.
3. **Comprimento.** A correta tem em média 5% mais caracteres que as erradas. Comprimento não é forte indicador na Unifor.
4. **Letra do gabarito.** Em ordem de frequência geral: C > D > B > A > E. **Evite E**, é a menos provável em todas as disciplinas.
5. **Por matéria:**
   - **matematica** → chute **D**
   - **fisica** → chute **C**
   - **biologia** → chute **B**
   - **quimica** → chute **C**
   - **humanas** → chute **A**
   - **linguagens** → chute **C**
6. **Questões numéricas:** quando 5 valores numéricos, **a mediana** valor é o mais comum (26.7%).