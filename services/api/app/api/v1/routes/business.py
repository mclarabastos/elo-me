from math import ceil

from fastapi import APIRouter

from app.core.text import normalize_payload_text


router = APIRouter()

BRAZIL_POPULATION = 213_421_037
MEDICAL_PLAN_BENEFICIARIES = 52_969_610
DENTAL_PLAN_BENEFICIARIES = 35_797_271
MEDICAL_PLAN_PENETRATION_PERCENT = 24.8
SAM_PERCENT = 20
SOM_PERCENT_OF_SAM = 0.1
SOM_CUSTOMERS = 10_594
B2C_AVERAGE_TICKET = 59.90


PRICING_PLANS = [
    {
        "id": "patient_essential",
        "name": "Paciente Essencial",
        "priceMonthlyBRL": 29.90,
        "audience": "Pacientes individuais",
        "description": (
            "Para pacientes que querem organizar seu histórico médico, "
            "controlar consentimentos e compartilhar dados seletivamente "
            "com profissionais de saúde."
        ),
    },
    {
        "id": "patient_premium",
        "name": "Paciente Premium",
        "priceMonthlyBRL": 59.90,
        "audience": "Pacientes recorrentes e segunda opinião",
        "description": (
            "Para pacientes que fazem acompanhamento recorrente, segunda "
            "opinião médica, exames frequentes ou querem mais recursos de "
            "portabilidade, alertas e histórico avançado."
        ),
    },
    {
        "id": "family",
        "name": "Plano Família",
        "priceMonthlyBRL": 99.90,
        "audience": "Famílias e dependentes",
        "description": (
            "Para famílias que querem centralizar prontuários de dependentes, "
            "filhos, idosos ou familiares em acompanhamento médico contínuo."
        ),
    },
    {
        "id": "clinic_professional",
        "name": "Clínica Professional",
        "priceMonthlyBRL": 499.00,
        "audience": "Clínicas privadas pequenas e médias",
        "description": (
            "Para clínicas privadas pequenas e médias que querem solicitar "
            "acesso autorizado ao histórico do paciente, reduzir risco "
            "jurídico e oferecer uma experiência digital segura."
        ),
    },
    {
        "id": "clinic_premium",
        "name": "Clínica Premium",
        "priceMonthlyBRL": 899.00,
        "audience": "Clínicas com maior volume",
        "description": (
            "Para clínicas com maior volume de pacientes, múltiplos "
            "profissionais, auditoria avançada, dashboard de consentimentos "
            "e integração futura com sistemas internos."
        ),
    },
    {
        "id": "enterprise",
        "name": "Institucional / Enterprise",
        "priceMonthlyBRL": None,
        "audience": "Operadoras, hospitais, laboratórios e redes",
        "description": (
            "Para operadoras, redes de clínicas, hospitais, laboratórios e "
            "parceiros estratégicos com demanda de integração, compliance "
            "e customização."
        ),
        "pricing": "sob consulta",
    },
]


def required_customers(target_revenue: int, ticket: float) -> int:
    return ceil(target_revenue / ticket)


@router.get("/model")
def get_business_model() -> dict[str, object]:
    return normalize_payload_text(
        {
            "positioning": (
                "SaaS premium de saúde digital para prontuário portátil, "
                "consentimento seletivo, auditoria e validação verificável."
            ),
            "problem": [
                "Dados médicos sensíveis ficam espalhados em clínicas, sistemas, PDFs, exames e laboratórios.",
                "Pacientes perdem controle sobre quem acessa seu histórico.",
                "Clínicas enfrentam risco jurídico, reputacional e operacional com dados sensíveis.",
                "Consultas, emergências e segunda opinião perdem contexto clínico.",
            ],
            "targetCustomers": [
                "Pacientes de classe média a alta com plano de saúde.",
                "Pessoas que fazem consultas particulares, exames frequentes ou segunda opinião médica.",
                "Pacientes que valorizam privacidade, organização e portabilidade.",
                "Clínicas privadas pequenas e médias.",
                "Futuramente operadoras, hospitais, laboratórios e redes de saúde.",
            ],
            "valueProposition": [
                "Prontuário portátil sob controle do paciente.",
                "Consentimento seletivo por escopo e tempo.",
                "Auditoria de acessos autorizados e negados.",
                "Dados sensíveis sempre off-chain.",
                "Blockchain apenas para provas, hashes, consentimentos e eventos.",
                "Chainlink CRE como camada de validação e orquestração.",
            ],
            "revenueStreams": [
                "Assinaturas B2C para pacientes premium.",
                "Assinaturas B2B para clínicas privadas.",
                "Modelo B2B2C com clínicas oferecendo Elo.me aos pacientes.",
                "Planos enterprise para operadoras e redes de saúde.",
            ],
            "pricingPlans": PRICING_PLANS,
            "annualSubscription": {
                "annualDiscountPercent": 15,
                "description": (
                    "A assinatura anual melhora previsibilidade de receita, "
                    "reduz churn e facilita planejamento de suporte e infraestrutura."
                ),
            },
            "goToMarket": [
                "Começar por clínicas privadas pequenas e médias.",
                "Oferecer experiência premium para pacientes de saúde privada.",
                "Usar B2B2C como canal inicial de confiança.",
                "Expandir para operadoras e redes após validação do MVP.",
            ],
            "whyNow": [
                "A preocupação com privacidade em saúde está crescendo.",
                "Wallet abstraction permite usar blockchain sem fricção para o usuário final.",
                "Chainlink CRE ajuda a orquestrar validações entre backend, contrato e regras externas.",
            ],
            "expansionOpportunities": [
                "Integração com operadoras.",
                "Parcerias com laboratórios.",
                "Segunda opinião médica.",
                "Gestão familiar de prontuários.",
                "Compliance e auditoria para redes de clínicas.",
            ],
        }
    )


@router.get("/market-sizing")
def get_market_sizing() -> dict[str, object]:
    sam_people = int(MEDICAL_PLAN_BENEFICIARIES * (SAM_PERCENT / 100))
    monthly_revenue = round(SOM_CUSTOMERS * B2C_AVERAGE_TICKET)
    annual_revenue = monthly_revenue * 12

    return normalize_payload_text(
        {
            "currency": "BRL",
            "sources": ["ANS", "IBGE"],
            "marketInputs": {
                "brazilPopulation": BRAZIL_POPULATION,
                "medicalPlanBeneficiaries": MEDICAL_PLAN_BENEFICIARIES,
                "dentalPlanBeneficiaries": DENTAL_PLAN_BENEFICIARIES,
                "medicalPlanPenetrationPercent": MEDICAL_PLAN_PENETRATION_PERCENT,
            },
            "tam": {
                "people": MEDICAL_PLAN_BENEFICIARIES,
                "description": (
                    "Universo mais aderente ao Elo.me: pessoas já inseridas "
                    "no mercado de saúde privada."
                ),
            },
            "sam": {
                "percentOfTam": SAM_PERCENT,
                "people": sam_people,
                "description": (
                    "Pacientes mais prováveis de pagar por organização, "
                    "privacidade, segunda opinião e portabilidade médica."
                ),
            },
            "som": {
                "percentOfSam": SOM_PERCENT_OF_SAM,
                "people": SOM_CUSTOMERS,
                "description": (
                    "Cenário de entrada capturável, usado apenas como "
                    "simulação de pitch."
                ),
            },
            "revenueSimulation": {
                "b2cAverageTicketMonthlyBRL": B2C_AVERAGE_TICKET,
                "monthlyPotentialBRL": monthly_revenue,
                "annualPotentialBRL": annual_revenue,
                "formula": "10.594 clientes * R$ 59,90/mês",
            },
            "disclaimer": (
                "Simulação mockada para pitch, não é promessa financeira "
                "nem projeção garantida."
            ),
        }
    )


@router.get("/break-even")
def get_break_even() -> dict[str, object]:
    scenarios = [
        {
            "name": "Cenário enxuto",
            "monthlyTargetBRL": 5000,
            "description": (
                "Cobre backend, frontend, banco, storage, ferramentas, "
                "domínio, monitoramento e pequenos custos operacionais."
            ),
            "equivalentCustomers": {
                "patientEssential": required_customers(5000, 29.90),
                "patientPremium": required_customers(5000, 59.90),
                "clinicProfessional": required_customers(5000, 499.00),
            },
            "mixedExample": "5 clínicas Professional + 42 pacientes Premium",
        },
        {
            "name": "Cenário operacional mínimo",
            "monthlyTargetBRL": 10000,
            "description": (
                "Cobre infraestrutura, manutenção técnica, suporte inicial, "
                "monitoramento, melhorias e custos de operação."
            ),
            "equivalentCustomers": {
                "patientEssential": required_customers(10000, 29.90),
                "patientPremium": required_customers(10000, 59.90),
                "clinicProfessional": required_customers(10000, 499.00),
            },
            "mixedExample": "10 clínicas Professional + 85 pacientes Premium",
        },
        {
            "name": "Cenário sustentável inicial",
            "monthlyTargetBRL": 25000,
            "description": (
                "Cobre equipe mínima, melhorias constantes, suporte, "
                "segurança, compliance inicial e operação com mais estabilidade."
            ),
            "equivalentCustomers": {
                "patientEssential": required_customers(25000, 29.90),
                "patientPremium": required_customers(25000, 59.90),
                "clinicProfessional": required_customers(25000, 499.00),
            },
            "mixedExample": "25 clínicas Professional + 209 pacientes Premium",
        },
    ]

    return normalize_payload_text(
        {
            "scenarios": scenarios,
            "mixedExamples": [scenario["mixedExample"] for scenario in scenarios],
            "interpretation": (
                "O caminho mais forte para receita inicial é B2B2C: clínicas "
                "privadas pagam para oferecer Elo.me aos pacientes, enquanto "
                "pacientes premium também podem assinar diretamente."
            ),
        }
    )


@router.get("/pitch-business-data")
def get_pitch_business_data() -> dict[str, object]:
    return normalize_payload_text(
        {
            "slides": [
                (
                    "O Elo.me nasce para o mercado de saúde privada, onde "
                    "mais de 52 milhões de brasileiros já possuem plano médico."
                ),
                (
                    "O problema real é que dados médicos sensíveis ficam "
                    "espalhados em clínicas, sistemas e documentos, aumentando "
                    "risco de vazamento, perda de histórico e exposição indevida."
                ),
                (
                    "Nosso primeiro caminho de receita é B2B2C: clínicas "
                    "privadas pagam para oferecer ao paciente um prontuário "
                    "portátil, consentimento verificável e auditoria."
                ),
                (
                    "O paciente premium também pode assinar diretamente para "
                    "organizar seu histórico, facilitar segunda opinião médica "
                    "e controlar quem acessa seus dados."
                ),
                "Operadoras e redes de saúde entram como expansão enterprise.",
                (
                    "Com cerca de 167 pacientes Premium ou 21 clínicas "
                    "Professional, a plataforma já poderia atingir um cenário "
                    "operacional mínimo de R$ 10 mil/mês."
                ),
            ],
            "commercialArgument": (
                "O Elo.me não vende apenas armazenamento de prontuário. "
                "O Elo.me vende controle, privacidade, portabilidade, "
                "confiança, continuidade de cuidado, auditoria e redução de "
                "risco para clínicas."
            ),
        }
    )
