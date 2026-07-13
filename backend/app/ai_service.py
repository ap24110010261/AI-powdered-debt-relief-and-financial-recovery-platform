import os
from groq import Groq
from app import models

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

FALLBACK_TEMPLATES = {
    "Professional": """Subject: Request for Debt Settlement – Account #{loan_id}

Dear {lender_name} Collections Team,

I am writing to formally request a settlement arrangement for my outstanding loan account. After a comprehensive review of my current financial situation, I have determined that I am unable to continue with the standard repayment schedule.

My current financial position:
- Monthly Income: ₹{monthly_income:,.0f}
- Monthly Expenses: ₹{monthly_expenses:,.0f}
- Total Outstanding Debt: ₹{outstanding_amount:,.0f}
- Current EMI Burden Ratio: {emi_ratio:.1f}%

I am in a state of financial hardship due to {hardship_reason}. This has significantly impacted my ability to maintain regular EMI payments. I sincerely request your consideration for a one-time settlement of ₹{settlement_amount:,.0f}, which represents approximately {settlement_pct:.0f}% of the outstanding balance.

I assure you of my commitment to honor this settlement upon agreement. Please contact me at your earliest convenience to discuss the terms.

Respectfully yours,
[Borrower Name]""",

    "Hardship": """Subject: Urgent Financial Hardship Settlement Request – Account #{loan_id}

Dear {lender_name} Customer Relations,

I write to you under significant financial duress. Due to {hardship_reason}, my income has been severely disrupted, making it impossible for me to meet the current EMI obligations of ₹{monthly_emi:,.0f} per month.

My financial stress level is currently classified as HIGH with an EMI-to-income ratio of {emi_ratio:.1f}%, far exceeding the manageable threshold of 30%.

I am requesting an emergency settlement of ₹{settlement_amount:,.0f} against the outstanding balance of ₹{outstanding_amount:,.0f}. This represents my maximum possible contribution given my current circumstances.

I have enclosed relevant documentation and am prepared to complete this settlement within 30 days of mutual agreement. I urge your compassionate consideration of this request.

With sincere regards,
[Borrower Name]""",

    "Urgent": """Subject: URGENT: Immediate Settlement Required – Account #{loan_id}

Dear {lender_name} Recovery Department,

This is an urgent settlement request for my overdue account. I have been experiencing severe financial difficulty due to {hardship_reason} and must resolve this matter immediately to prevent further deterioration of my financial health.

Outstanding Balance: ₹{outstanding_amount:,.0f}
Proposed Settlement: ₹{settlement_amount:,.0f} ({settlement_pct:.0f}% of outstanding)
Payment Timeline: Within 15 days of agreement

My current monthly surplus of ₹{monthly_surplus:,.0f} cannot sustain the existing EMI structure. I request an immediate response and am ready to execute this settlement upon confirmation.

Time is critical. Please respond urgently.

Regards,
[Borrower Name]"""
}


def generate_negotiation_letter(
    user: models.User,
    loan: models.Loan,
    financial_profile: models.FinancialProfile,
    hardship_reason: str,
    tone: str,
    settlement_amount: float,
    settlement_pct: float
) -> dict:
    """Generate a negotiation letter using Groq API with fallback."""
    
    context = {
        "loan_id": loan.id,
        "lender_name": loan.lender_name,
        "monthly_income": financial_profile.monthly_income if financial_profile else 50000,
        "monthly_expenses": financial_profile.monthly_expenses if financial_profile else 30000,
        "monthly_surplus": financial_profile.monthly_surplus if financial_profile else 5000,
        "outstanding_amount": loan.outstanding_amount,
        "monthly_emi": loan.monthly_emi,
        "emi_ratio": financial_profile.emi_ratio if financial_profile else 50,
        "hardship_reason": hardship_reason,
        "settlement_amount": settlement_amount,
        "settlement_pct": settlement_pct,
        "stress_level": financial_profile.stress_level if financial_profile else "High",
        "overdue_months": loan.overdue_months
    }

    strategy = ""
    letter = ""
    used_ai = False

    if GROQ_API_KEY:
        try:
            client = Groq(api_key=GROQ_API_KEY)
            
            prompt = f"""You are a professional debt settlement advisor helping borrowers in financial distress.

Generate a {tone} debt settlement negotiation letter for the following case:

Borrower Details:
- Name: {user.name}
- Monthly Income: ₹{context['monthly_income']:,.0f}
- Monthly Expenses: ₹{context['monthly_expenses']:,.0f}  
- Monthly Surplus: ₹{context['monthly_surplus']:,.0f}
- EMI-to-Income Ratio: {context['emi_ratio']:.1f}%
- Financial Stress Level: {context['stress_level']}

Loan Details:
- Lender: {loan.lender_name}
- Loan Type: {loan.loan_type}
- Outstanding Amount: ₹{loan.outstanding_amount:,.0f}
- Monthly EMI: ₹{loan.monthly_emi:,.0f}
- Interest Rate: {loan.interest_rate}%
- Overdue Months: {loan.overdue_months}
- Proposed Settlement: ₹{settlement_amount:,.0f} ({settlement_pct:.0f}% of outstanding)

Hardship Reason: {hardship_reason}
Tone Required: {tone}

Please write:
1. A professional settlement negotiation letter (formal, empathetic, structured)
2. A brief negotiation strategy (3-4 bullet points)

Format the letter with proper salutation, body paragraphs, and closing. Use ₹ for currency."""

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert debt settlement advisor and legal letter writer specializing in Indian financial regulations."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                max_tokens=2000,
            )
            
            full_text = chat_completion.choices[0].message.content
            
            # Split into strategy and letter if possible
            if "STRATEGY" in full_text.upper() or "STRATEGY:" in full_text.upper():
                parts = full_text.split("\n\n", 1)
                strategy = parts[0] if len(parts) > 1 else "AI-generated strategy"
                letter = parts[1] if len(parts) > 1 else full_text
            else:
                letter = full_text
                strategy = f"• Settlement offer of ₹{settlement_amount:,.0f} ({settlement_pct:.0f}% of outstanding)\n• {tone} tone approach targeting {loan.lender_name}\n• Highlight {hardship_reason} as primary hardship cause\n• Request written confirmation within 15 business days"
            
            used_ai = True

        except Exception as e:
            print(f"Groq API error: {e}, falling back to templates")

    if not used_ai:
        # Use fallback template
        template_key = tone if tone in FALLBACK_TEMPLATES else "Professional"
        letter = FALLBACK_TEMPLATES[template_key].format(**context)
        strategy = (
            f"• Settlement offer: ₹{settlement_amount:,.0f} ({settlement_pct:.0f}% of outstanding balance)\n"
            f"• Approach: {tone} correspondence to {loan.lender_name}\n"
            f"• Primary hardship: {hardship_reason}\n"
            f"• Key metric: EMI ratio at {context['emi_ratio']:.1f}% demonstrates genuine financial stress\n"
            f"• Timeline: Request resolution within 30 days"
        )

    return {
        "strategy": strategy,
        "letter": letter,
        "used_ai": used_ai
    }
