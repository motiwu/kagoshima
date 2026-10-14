/** 區塊標題：日文小標（細線裝飾）＋ 中文主標 */
export function SectionTitle({ ja, children }: { ja: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="rule-title font-serif text-[15px] tracking-[0.3em] text-bronze">{ja}</p>
      <h2 className="mt-3 text-[1.75rem] text-navy sm:text-4xl">{children}</h2>
    </div>
  )
}
