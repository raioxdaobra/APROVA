'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Como funciona o teste grátis do plano Pro?',
    answer:
      'Você pode usar o plano Pro por 7 dias sem custo, sem precisar inserir cartão. Depois desse período, sua conta volta automaticamente para o Free se você não assinar — nada de cobrança surpresa.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. O cancelamento é feito em um clique direto na sua área de configurações. Sem fidelidade, sem multa, sem precisar falar com ninguém.',
  },
  {
    question: 'A plataforma funciona offline?',
    answer:
      'Sim. APROVA é um PWA (Progressive Web App) — você instala no celular e estuda offline. Suas respostas sincronizam automaticamente quando a conexão volta. Disponível no plano Pro.',
  },
  {
    question: 'As questões são realmente da prova oficial?',
    answer:
      'Todas as 1.000+ questões vêm de provas oficiais da Unifor Medicina dos últimos 20 anos. Cada questão é marcada com ano, matéria e dificuldade. Questões anuladas pela banca são excluídas do banco.',
  },
  {
    question: 'A IA é confiável pra estudar pra prova?',
    answer:
      'Nossa IA é especializada em vestibular médico, com fontes citadas e foco no conteúdo do edital. Mas ela é uma ferramenta de apoio — sempre que possível, valide com seu professor ou material oficial.',
  },
];

/**
 * FAQ em accordion controlado (single-open). Acessível com aria-expanded.
 */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="container mx-auto max-w-3xl px-4 py-16 sm:py-24"
      aria-labelledby="faq-title"
    >
      <ScrollReveal className="mb-12 text-center">
        <h2
          id="faq-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Perguntas frequentes
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Não achou o que procurava?{' '}
          <a
            href="mailto:contato@aprova.app"
            className="text-primary underline-offset-4 hover:underline"
          >
            Fale com a gente
          </a>
          .
        </p>
      </ScrollReveal>

      <ul className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `faq-panel-${idx}`;
          const buttonId = `faq-button-${idx}`;
          return (
            <ScrollReveal key={faq.question} delay={idx * 60} as="li">
              <div
                className={cn(
                  'rounded-xl border bg-card transition-colors duration-300',
                  isOpen ? 'border-primary/40' : 'border-border',
                )}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300',
                      isOpen && 'rotate-180 text-primary',
                    )}
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </ul>
    </section>
  );
}
