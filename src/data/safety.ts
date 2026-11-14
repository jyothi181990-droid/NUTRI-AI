export interface SafetyGuideSection {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  criticalRule: string;
}

export const FOOD_SAFETY_GUIDES: SafetyGuideSection[] = [
  {
    id: 'visual-limits',
    title: 'Why Visual Appearance Alone Cannot Establish Food Safety',
    summary:
      'Food can look vibrant, smell normal, and still harbor dangerous microorganisms or heat-stable toxins. Neither human eyesight nor AI camera analysis can verify microbiological safety.',
    keyPoints: [
      'Pathogens such as Salmonella, E. coli, Listeria, and Campylobacter do not change color, texture, or odor at infectious levels.',
      'Mycotoxins and bacterial toxins (like Staphylococcus aureus enterotoxins or Bacillus cereus emetic toxin in improperly stored cooked rice) remain active even after reheating.',
      'Chemical residues, heavy metals, and undeclared allergens are completely invisible in photographs.',
      'Treat camera observations (discoloration, charring, mold-like patches) strictly as preliminary visual cues—never as clearance to eat questionable food.',
    ],
    criticalRule: 'Rule: When in doubt about temperature history, smell, or contamination, discard the food.',
  },
  {
    id: 'storage-refrigeration',
    title: 'Food Storage & Refrigeration Temperature Control',
    summary:
      'Bacteria multiply rapidly in the temperature Danger Zone between 5°C and 60°C (41°F–140°F). Proper chilling slows growth dramatically.',
    keyPoints: [
      'Keep refrigerator interiors at or below 4°C (40°F) and freezers at -18°C (0°F) or colder.',
      'Refrigerate cooked leftovers (including cooked rice, dals, curries, meat, and dairy) within 2 hours of cooking—or within 1 hour when ambient temperature exceeds 32°C (common in Indian summers).',
      'Divide large pots of hot sambar, biryani, or stew into shallow containers so they cool evenly and quickly in the fridge.',
      'Store raw meat, poultry, and seafood on the lowest refrigerator shelf in sealed trays so drips cannot fall onto ready-to-eat foods.',
    ],
    criticalRule: 'Cooked rice & dal left overnight at room temperature pose serious Bacillus cereus risk even if reheated.',
  },
  {
    id: 'expiry-dates',
    title: 'Understanding Expiry, Use By & Best Before Dates',
    summary:
      'Date labels on packaged foods serve very different legal and safety functions depending on the wording.',
    keyPoints: [
      'Use By / Expiry Date: Safety-critical deadline for perishable foods (milk, fresh paneer, chilled meats, ready-to-eat salads). Do not consume after this date.',
      'Best Before: Quality indicator (crispness, aroma, vitamin potency) used on shelf-stable foods like dry pulses, spices, oats, and biscuits—safe if unopened, intact, and free of pests/moisture.',
      'Sell By / Packed On: Inventory guide for retailers and consumers to judge freshness window.',
      'Once opened, follow the "consume within X days of opening" instruction regardless of the original printed expiry date.',
    ],
    criticalRule: 'Never rely solely on date labels if packaging is swollen, leaking, rusted, or punctured.',
  },
  {
    id: 'hygiene-handling',
    title: 'Personal Hygiene & Safe Food Handling',
    summary:
      'Clean hands, sanitized prep surfaces, and safe cooking temperatures eliminate most kitchen-borne hazards.',
    keyPoints: [
      'Wash hands thoroughly with soap and clean running water for at least 20 seconds before handling food, after touching raw meat/eggs, and after using the restroom.',
      'Rinse whole fruits and vegetables under clean running water before peeling or cutting so surface microbes are not dragged inward by the knife.',
      'Cook poultry and reheated leftovers thoroughly to an internal temperature of at least 74°C (165°F) until steaming hot throughout.',
      'Use safe, potable water for washing leafy greens, sprouting pulses, and preparing cold chutneys or drinks.',
    ],
    criticalRule: 'Avoid washing raw chicken under a running tap—splashes spread Campylobacter across sinks and counters.',
  },
  {
    id: 'cross-contamination',
    title: 'Preventing Cross-Contamination',
    summary:
      'Cross-contamination happens when microbes or allergens transfer from raw ingredients, utensils, or hands onto cooked or ready-to-eat foods.',
    keyPoints: [
      'Maintain separate cutting boards and knives for raw meat/fish versus fresh vegetables, fruits, and cooked dishes.',
      'Wash boards, knives, and counters with hot soapy water immediately after raw preparation.',
      'Never place cooked kebabs, grilled fish, or cut fruit back onto the unwashed plate that held raw ingredients.',
      'In vegetarian/vegan or allergy-aware kitchens, use dedicated clean spoons and cookware to prevent trace allergen transfer.',
    ],
    criticalRule: 'Color-coding cutting boards (e.g., green for produce, red for raw meat) prevents accidental swaps.',
  },
  {
    id: 'allergen-awareness',
    title: 'Food Allergy Warnings & Hidden Triggers',
    summary:
      'Even microscopic traces of an allergen can trigger severe anaphylaxis in sensitive individuals.',
    keyPoints: [
      'Major global & Indian allergens include peanuts, tree nuts (cashews, almonds, pistachios), cow milk/dairy (paneer, ghee, whey), eggs, wheat/gluten, soy, sesame (til), mustard, fish, and crustacean shellfish.',
      'Check packaged labels for both ingredient lists and "May contain" / shared facility advisories.',
      'Traditional restaurant gravies often use cashew paste, melon seeds, peanut powder, or wheat flour thickeners without listing them on menus.',
      'Heat does NOT destroy major food allergens—cooking peanut oil or milk protein does not make it safe for an allergic person.',
    ],
    criticalRule: 'Always verify exact ingredients with food preparers when managing severe allergies.',
  },
  {
    id: 'visible-spoilage',
    title: 'Recognizing Visible Spoilage & Unsafe Packaging',
    summary:
      'While clean appearance never guarantees safety, visible spoilage signs are reliable warnings to discard food immediately.',
    keyPoints: [
      'Fuzzy green, white, black, or pink mold spots on bread, pickles, nuts, or cheese: discard porous foods entirely (mold roots penetrate far deeper than the visible surface).',
      'Slimy film on cooked vegetables, meat, or paneer, or sour/ammonia/yeasty off-odors in dals, milk, and batters.',
      'Bulging or dented canned foods, fizzing in non-carbonated juices, or broken tamper-evident seals.',
      'Heavy dark charring or burnt acrylamide/PAH crusts on grilled/fried starches and meats should be trimmed or avoided.',
    ],
    criticalRule: 'Never scrape mold off soft bread, cooked grains, or soft dairy—discard the entire item.',
  },
];
