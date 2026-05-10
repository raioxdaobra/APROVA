# Cheat sheet — padrões da banca Unifor Medicina

> Análise estatística sobre **106** questões não-anuladas com alternativas extraídas via OCR (Groq Llama 4 Scout). Geração: 10/05/2026, 11:03:19.

> ⚠ Análise descritiva, não preditiva. Indica tendências, não regras absolutas.


## 1. Comprimento da alternativa (chars)

| | Média | Mínimo | Máximo |
|---|---|---|---|
| Correta (1 por questão) | 50.1 | 1 | 285 |
| Errada (4 por questão) | 49.0 | 1 | 434 |

**Diferença:** correta tem em média **1 chars** a mais que erradas (**+2.2%**).

### Por disciplina

| Disciplina | Correta (chars) | Errada (chars) | Diferença |
|---|---|---|---|
| matematica | 9.9 | 9.6 | +0.3 |
| fisica | 12.8 | 12.8 | -0.1 |
| biologia | 46.3 | 48.9 | -2.6 |
| humanas | 135.6 | 119.0 | +16.6 |
| quimica | 71.1 | 77.4 | -6.3 |
| linguagens | 49.9 | 54.1 | -4.2 |

## 2. Termos absolutos (sempre, nunca, todos, nenhum, exclusivamente, ...)

- Em alternativas **CORRETAS**: 2 ocorrências em 106 alternativas (média **0.02/alt**)
- Em alternativas **ERRADAS**: 13 ocorrências em 422 alternativas (média **0.03/alt**)
- **Razão errada:correta = 1.63x** — termos absolutos aparecem MAIS em distratores ✓

## 3. Qualificadores (geralmente, pode, tende, costuma, ...)

- Em alternativas **CORRETAS**: 9 ocorrências (média **0.08/alt**)
- Em alternativas **ERRADAS**: 32 ocorrências (média **0.08/alt**)
- **Razão correta:errada = 1.12x** — qualificadores aparecem MAIS em corretas ✓

## 4. Termos de negação (não, incorreto, exceto, ...)

- Em alternativas **CORRETAS**: 3 ocorrências (média **0.03/alt**)
- Em alternativas **ERRADAS**: 24 ocorrências (média **0.06/alt**)

## 5. Questões com 5 alternativas numéricas

- Total de questões puramente numéricas: **36**
- Posição da resposta correta (ordenando alternativas do menor pro maior):

| Rank | Frequência |
|---|---|
| Menor (1º) | 7 (19.4%) |
| 2º | 6 (16.7%) |
| Mediana (3º) | 8 (22.2%) |
| 4º | 7 (19.4%) |
| Maior (5º) | 8 (22.2%) |

**Tendência:** valor **Mediana (3º)** é o mais comum.

## 6. "Todas/nenhuma das anteriores"

Não detectadas no banco.

## 7. Letra correta mais comum por disciplina

| Disciplina | A | B | C | D | E | Lider |
|---|---|---|---|---|---|---|
| matematica | 20.6% | 23.5% | 26.5% | 20.6% | 8.8% | **C** |
| fisica | 25.0% | 25.0% | 25.0% | 12.5% | 12.5% | **A** |
| biologia | 33.3% | 22.2% | 0.0% | 33.3% | 11.1% | **A** |
| humanas | 22.2% | 27.8% | 16.7% | 16.7% | 16.7% | **B** |
| quimica | 37.5% | 12.5% | 25.0% | 0.0% | 25.0% | **A** |
| linguagens | 17.2% | 27.6% | 10.3% | 17.2% | 27.6% | **B** |

## 🎯 Cheat sheet final

Se precisar chutar, em ordem de prioridade:

1. **Olhe os termos absolutos.** Alternativas com "sempre", "nunca", "todos", "nenhum", "exclusivamente" tendem a ser distratores. Elimine elas primeiro.
2. **Olhe os qualificadores.** Alternativas com "geralmente", "tende a", "pode", "na maioria dos casos" tendem a ser corretas. Foque nelas.
3. **Comprimento.** A correta tem em média 2% mais caracteres que as erradas. Comprimento não é forte indicador na Unifor.
4. **Letra do gabarito.** Em ordem de frequência geral: C > D > B > A > E. **Evite E**, é a menos provável em todas as disciplinas.
5. **Por matéria:**
   - **matematica** → chute **C**
   - **fisica** → chute **A**
   - **biologia** → chute **A**
   - **humanas** → chute **B**
   - **quimica** → chute **A**
   - **linguagens** → chute **B**
6. **Questões numéricas:** quando 5 valores numéricos, **a mediana** valor é o mais comum (22.2%).