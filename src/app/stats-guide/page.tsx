import Link from "next/link";

export default function StatsGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">The Volunteer's Guide to Statistics</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
          You don't need to be a math genius to find voter roll anomalies. You just need to know how to spot the <em>really</em> weird stuff. This guide will teach you how to separate harmless noise from targeted, high-signal anomalies.
        </p>
      </div>

      <div className="card space-y-8">
        
        {/* Section 1 */}
        <section>
          <h3 className="text-2xl font-bold border-b border-border pb-2 text-primary">1. Why Statistics? (Finding the Needle)</h3>
          <p className="text-base leading-relaxed mt-4">
            Imagine looking at a spreadsheet of 2 million voters. If you see a house with 8 registered voters, is that fraud, or is it just a big family? If 500 people register to vote on a Tuesday, is that a coordinated data dump, or just National Voter Registration Day?
          </p>
          <p className="text-base leading-relaxed mt-4">
            Without statistics, we are just guessing. Statistics gives us a <strong>mathematical magnifying glass</strong>. It allows us to ask the computer: <em>"Tell me what is mathematically impossible to happen by normal chance."</em> When we do that, we stop wasting time on big families and start focusing on commercial warehouses with 400 registered voters.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="text-2xl font-bold border-b border-border pb-2 text-primary">2. The Danger of "The Average" (Mean)</h3>
          <div className="bg-muted/30 p-4 rounded-lg my-4 border-l-4 border-secondary">
            <h4 className="font-bold mb-1">The "Bill Gates in a Bar" Analogy</h4>
            <p className="text-sm">
              Imagine 10 regular people are sitting in a bar. Their average net worth is $50,000. Suddenly, billionaire Bill Gates walks into the bar. If you calculate the average net worth of the room now, everyone in the bar is technically a billionaire <em>on average</em>. 
            </p>
          </div>
          <p className="text-base leading-relaxed">
            This is why the <strong>Mean (Average)</strong> is a very dangerous trap when auditing voter rolls. If you ask the Chat Agent, <em>"What is the average number of voters per address in Hinds County?"</em>, it might say 2.1. But that number is a lie. Why? Because there might be a massive nursing home with 500 people in it that is pulling the average up, masking the reality. 
          </p>
          <p className="text-base leading-relaxed mt-4">
            <strong>The Fix:</strong> Always ask the AI for the <strong>Median</strong>. The median is the true "middle" number. If Bill Gates walks into the bar, the median net worth stays exactly the same, because it ignores extreme outliers. If the Median is 2, but the Average is 6, you instantly know there are massive, suspicious buildings hiding in your county!
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h3 className="text-2xl font-bold border-b border-border pb-2 text-primary">3. Standard Deviation (Measuring the Chaos)</h3>
          <p className="text-base leading-relaxed mt-4">
            If the "Average" tells us where the middle is, the <strong>Standard Deviation</strong> tells us how chaotic the data is. 
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li><strong>Low Standard Deviation:</strong> Everyone is acting exactly the same. (e.g. Every house on a street has exactly 1 or 2 voters).</li>
            <li><strong>High Standard Deviation:</strong> Total chaos. Some houses have 1 voter, some have 15, some have 100. </li>
          </ul>
          <p className="text-base leading-relaxed mt-4">
            When you chat with the Marigold Assistant, if it tells you the standard deviation is huge, that is your signal to stop looking at the big picture and start hunting for specific crazy addresses.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h3 className="text-2xl font-bold border-b border-border pb-2 text-primary">4. The Z-Score (Your Ultimate Weapon)</h3>
          <p className="text-base leading-relaxed mt-4">
            This is the most important concept to learn. A <strong>Z-Score</strong> is a standardized way to measure exactly how abnormal an outlier is. Think of it like a "Suspicion Rating" from 0 to 5.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="p-4 border border-border rounded-lg bg-green-50 text-green-900">
              <h4 className="font-bold text-lg mb-1">Z-Score: 0 to 1</h4>
              <p className="text-sm">Totally normal. Just a regular house with a regular family.</p>
            </div>
            <div className="p-4 border border-border rounded-lg bg-amber-50 text-amber-900">
              <h4 className="font-bold text-lg mb-1">Z-Score: 2</h4>
              <p className="text-sm">Unusual, but possible. Maybe a house with 8 college students renting it.</p>
            </div>
            <div className="p-4 border border-border rounded-lg bg-red-50 text-red-900 shadow-md">
              <h4 className="font-bold text-lg mb-1">Z-Score: 3+</h4>
              <p className="text-sm font-bold">MATHEMATICAL ANOMALY.</p>
              <p className="text-xs mt-1">This is a nursing home, a commercial warehouse, or a data glitch. Investigate immediately.</p>
            </div>
          </div>
          <p className="text-base leading-relaxed">
            When you ask the Chat Agent to analyze data, it uses a powerful library called `jStat` to calculate Z-Scores. If the AI tells you, <em>"I found a spike with a Z-Score of 4.2"</em>, you don't need to be a math nerd to know what that means—it means you caught something completely unnatural in the data.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h3 className="text-2xl font-bold border-b border-border pb-2 text-primary">5. How to Craft High-Signal Searches</h3>
          <p className="text-base leading-relaxed mt-4">
            Now that you know the language, how do you actually find anomalies in <strong><Link href="/analysis" className="text-primary underline">Pro Mode</Link></strong>?
          </p>

          <div className="space-y-6 mt-6">
            <div className="bg-muted/10 p-5 rounded-xl border border-border">
              <h4 className="font-bold text-lg mb-2">Target 1: The "Phantom Registration Dump"</h4>
              <p className="text-sm text-muted-foreground mb-3">Goal: Find days where an unnatural amount of people were registered.</p>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Go to the Chat Agent and type: <em>"Run a statistical analysis on daily registrations for Desoto county."</em></li>
                <li>The AI will tell you the average registrations per day, and the Z-Score of the highest day.</li>
                <li>If the Z-Score is over 3, ask the AI: <em>"What threshold should I use to find that spike?"</em></li>
                <li>Go to <strong>Pro Mode</strong>, type in "Desoto", set the threshold slider to the number the AI gave you, and run the <strong>Registration Spikes</strong> audit.</li>
              </ol>
            </div>

            <div className="bg-muted/10 p-5 rounded-xl border border-border">
              <h4 className="font-bold text-lg mb-2">Target 2: The "Clown Car Address"</h4>
              <p className="text-sm text-muted-foreground mb-3">Goal: Find single-family homes that have way too many active voters.</p>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Go to Pro Mode. Leave the county blank (Statewide).</li>
                <li>Set the Threshold Slider to <strong>15</strong>. (A Z-Score of 3 usually hits around here for residential homes).</li>
                <li>Run the <strong>High-Density Occupancy</strong> audit.</li>
                <li>When the results load, look at the "Category" column. If it says "University" or "Hospital", click the <strong>👎 Exclude</strong> button so your team never has to look at it again.</li>
                <li>Whatever is left on your list is a high-signal anomaly! Save it as a Playbook.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <h3 className="text-xl font-bold mb-2">Still Confused? Just Ask Marigold!</h3>
          <p className="text-muted-foreground mb-6">
            The Chat Agent is specifically programmed to translate nerdy math into plain English. Never be afraid to type: <em>"I don't understand what Kurtosis means, explain it to me like I'm 5 years old."</em>
          </p>
          <Link href="/chat" className="btn-primary inline-block">
            Talk to the Chat Agent
          </Link>
        </div>

      </div>
    </div>
  );
}
