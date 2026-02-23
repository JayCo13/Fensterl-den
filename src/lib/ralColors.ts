// RAL Classic color codes to hex values mapping
// This is a subset of the most common RAL colors

export const RAL_COLORS: Record<string, { hex: string; name: string }> = {
    // RAL 1000 series - Yellow and Beige
    "1000": { hex: "#BEBD7F", name: "Grünbeige" },
    "1001": { hex: "#C2B078", name: "Beige" },
    "1002": { hex: "#C6A664", name: "Sandgelb" },
    "1003": { hex: "#E5BE01", name: "Signalgelb" },
    "1004": { hex: "#CDA434", name: "Goldgelb" },
    "1005": { hex: "#A98307", name: "Honiggelb" },
    "1006": { hex: "#E4A010", name: "Maisgelb" },
    "1007": { hex: "#DC9D00", name: "Narzissengelb" },
    "1011": { hex: "#8A6642", name: "Braunbeige" },
    "1012": { hex: "#C7B446", name: "Zitronengelb" },
    "1013": { hex: "#EAE6CA", name: "Perlweiß" },
    "1014": { hex: "#E1CC4F", name: "Elfenbein" },
    "1015": { hex: "#E6D690", name: "Hellelfenbein" },
    "1016": { hex: "#EDFF21", name: "Schwefelgelb" },
    "1017": { hex: "#F5D033", name: "Safrangelb" },
    "1018": { hex: "#F8F32B", name: "Zinkgelb" },
    "1019": { hex: "#9E9764", name: "Graubeige" },
    "1020": { hex: "#999950", name: "Olivgelb" },
    "1021": { hex: "#F3DA0B", name: "Rapsgelb" },
    "1023": { hex: "#FAD201", name: "Verkehrsgelb" },
    "1024": { hex: "#AEA04B", name: "Ockergelb" },
    "1026": { hex: "#FFFF00", name: "Leuchtgelb" },
    "1027": { hex: "#9D9101", name: "Currygelb" },
    "1028": { hex: "#F4A900", name: "Melonengelb" },
    "1032": { hex: "#D6AE01", name: "Ginstergelb" },
    "1033": { hex: "#F3A505", name: "Dahliengelb" },
    "1034": { hex: "#EFA94A", name: "Pastellgelb" },
    "1035": { hex: "#6A5D4D", name: "Perlbeige" },
    "1036": { hex: "#705335", name: "Perlgold" },
    "1037": { hex: "#F39F18", name: "Sonnengelb" },

    // RAL 2000 series - Orange
    "2000": { hex: "#ED760E", name: "Gelborange" },
    "2001": { hex: "#C93C20", name: "Rotorange" },
    "2002": { hex: "#CB2821", name: "Blutorange" },
    "2003": { hex: "#FF7514", name: "Pastellorange" },
    "2004": { hex: "#F44611", name: "Reinorange" },
    "2005": { hex: "#FF2301", name: "Leuchtorange" },
    "2007": { hex: "#FFA420", name: "Leuchthellorange" },
    "2008": { hex: "#F75E25", name: "Hellrotorange" },
    "2009": { hex: "#F54021", name: "Verkehrsorange" },
    "2010": { hex: "#D84B20", name: "Signalorange" },
    "2011": { hex: "#EC7C26", name: "Tieforange" },
    "2012": { hex: "#E55137", name: "Lachsorange" },
    "2013": { hex: "#C35831", name: "Perlorange" },

    // RAL 3000 series - Red
    "3000": { hex: "#AF2B1E", name: "Feuerrot" },
    "3001": { hex: "#A52019", name: "Signalrot" },
    "3002": { hex: "#A2231D", name: "Karminrot" },
    "3003": { hex: "#9B111E", name: "Rubinrot" },
    "3004": { hex: "#75151E", name: "Purpurrot" },
    "3005": { hex: "#5E2129", name: "Weinrot" },
    "3007": { hex: "#412227", name: "Schwarzrot" },
    "3009": { hex: "#642424", name: "Oxidrot" },
    "3011": { hex: "#781F19", name: "Braunrot" },
    "3012": { hex: "#C1876B", name: "Beigerot" },
    "3013": { hex: "#A12312", name: "Tomatenrot" },
    "3014": { hex: "#D36E70", name: "Altrosa" },
    "3015": { hex: "#EA899A", name: "Hellrosa" },
    "3016": { hex: "#B32821", name: "Korallenrot" },
    "3017": { hex: "#E63244", name: "Rosé" },
    "3018": { hex: "#D53032", name: "Erdbeerrot" },
    "3020": { hex: "#CC0605", name: "Verkehrsrot" },
    "3022": { hex: "#D95030", name: "Lachsrot" },
    "3024": { hex: "#F80000", name: "Leuchtrot" },
    "3026": { hex: "#FE0000", name: "Leuchthellrot" },
    "3027": { hex: "#C51D34", name: "Himbeerrot" },
    "3028": { hex: "#CB3234", name: "Reinrot" },
    "3031": { hex: "#B32428", name: "Orientrot" },
    "3032": { hex: "#721422", name: "Perlrubinrot" },
    "3033": { hex: "#B44C43", name: "Perlrosa" },

    // RAL 4000 series - Violet
    "4001": { hex: "#6D3461", name: "Rotlila" },
    "4002": { hex: "#922B3E", name: "Rotviolett" },
    "4003": { hex: "#DE4C8A", name: "Erikaviolett" },
    "4004": { hex: "#641C34", name: "Bordeauxviolett" },
    "4005": { hex: "#6C4675", name: "Blaulila" },
    "4006": { hex: "#A03472", name: "Verkehrspurpur" },
    "4007": { hex: "#4A192C", name: "Purpurviolett" },
    "4008": { hex: "#924E7D", name: "Signalviolett" },
    "4009": { hex: "#A18594", name: "Pastellviolett" },
    "4010": { hex: "#CF3476", name: "Telemagenta" },
    "4011": { hex: "#8673A1", name: "Perlviolett" },
    "4012": { hex: "#6C6874", name: "Perlbrombeer" },

    // RAL 5000 series - Blue
    "5000": { hex: "#354D73", name: "Violettblau" },
    "5001": { hex: "#1F3438", name: "Grünblau" },
    "5002": { hex: "#20214F", name: "Ultramarinblau" },
    "5003": { hex: "#1D1E33", name: "Saphirblau" },
    "5004": { hex: "#18171C", name: "Schwarzblau" },
    "5005": { hex: "#1E2460", name: "Signalblau" },
    "5007": { hex: "#3E5F8A", name: "Brillantblau" },
    "5008": { hex: "#26252D", name: "Graublau" },
    "5009": { hex: "#025669", name: "Azurblau" },
    "5010": { hex: "#0E294B", name: "Enzianblau" },
    "5011": { hex: "#231A24", name: "Stahlblau" },
    "5012": { hex: "#3B83BD", name: "Lichtblau" },
    "5013": { hex: "#1E213D", name: "Kobaltblau" },
    "5014": { hex: "#606E8C", name: "Taubenblau" },
    "5015": { hex: "#2271B3", name: "Himmelblau" },
    "5017": { hex: "#063971", name: "Verkehrsblau" },
    "5018": { hex: "#3F888F", name: "Türkisblau" },
    "5019": { hex: "#1B5583", name: "Capriblau" },
    "5020": { hex: "#1D334A", name: "Ozeanblau" },
    "5021": { hex: "#256D7B", name: "Wasserblau" },
    "5022": { hex: "#252850", name: "Nachtblau" },
    "5023": { hex: "#49678D", name: "Fernblau" },
    "5024": { hex: "#5D9B9B", name: "Pastellblau" },
    "5025": { hex: "#2A6478", name: "Perlenzian" },
    "5026": { hex: "#102C54", name: "Perlnachtblau" },

    // RAL 6000 series - Green
    "6000": { hex: "#316650", name: "Patinagrün" },
    "6001": { hex: "#287233", name: "Smaragdgrün" },
    "6002": { hex: "#2D572C", name: "Laubgrün" },
    "6003": { hex: "#424632", name: "Olivgrün" },
    "6004": { hex: "#1F3A3D", name: "Blaugrün" },
    "6005": { hex: "#2F4538", name: "Moosgrün" },
    "6006": { hex: "#3E3B32", name: "Grauoliv" },
    "6007": { hex: "#343B29", name: "Flaschengrün" },
    "6008": { hex: "#39352A", name: "Braungrün" },
    "6009": { hex: "#31372B", name: "Tannengrün" },
    "6010": { hex: "#35682D", name: "Grasgrün" },
    "6011": { hex: "#587246", name: "Resedagrün" },
    "6012": { hex: "#343E40", name: "Schwarzgrün" },
    "6013": { hex: "#6C7156", name: "Schilfgrün" },
    "6014": { hex: "#47402E", name: "Gelboliv" },
    "6015": { hex: "#3B3C36", name: "Schwarzoliv" },
    "6016": { hex: "#1E5945", name: "Türkisgrün" },
    "6017": { hex: "#4C9141", name: "Maigrün" },
    "6018": { hex: "#57A639", name: "Gelbgrün" },
    "6019": { hex: "#BDECB6", name: "Weißgrün" },
    "6020": { hex: "#2E3A23", name: "Chromoxidgrün" },
    "6021": { hex: "#89AC76", name: "Blaßgrün" },
    "6022": { hex: "#25221B", name: "Braunoliv" },
    "6024": { hex: "#308446", name: "Verkehrsgrün" },
    "6025": { hex: "#3D642D", name: "Farngrün" },
    "6026": { hex: "#015D52", name: "Opalgrün" },
    "6027": { hex: "#84C3BE", name: "Lichtgrün" },
    "6028": { hex: "#2C5545", name: "Kieferngrün" },
    "6029": { hex: "#20603D", name: "Minzgrün" },
    "6032": { hex: "#317F43", name: "Signalgrün" },
    "6033": { hex: "#497E76", name: "Minttürkis" },
    "6034": { hex: "#7FB5B5", name: "Pastelltürkis" },
    "6035": { hex: "#1C542D", name: "Perlgrün" },
    "6036": { hex: "#193737", name: "Perlopalgrün" },
    "6037": { hex: "#008F39", name: "Reingrün" },
    "6038": { hex: "#00BB2D", name: "Leuchtgrün" },

    // RAL 7000 series - Grey
    "7000": { hex: "#78858B", name: "Fehgrau" },
    "7001": { hex: "#8A9597", name: "Silbergrau" },
    "7002": { hex: "#7E7B52", name: "Olivgrau" },
    "7003": { hex: "#6C7059", name: "Moosgrau" },
    "7004": { hex: "#969992", name: "Signalgrau" },
    "7005": { hex: "#646B63", name: "Mausgrau" },
    "7006": { hex: "#6D6552", name: "Beigegrau" },
    "7008": { hex: "#6A5F31", name: "Khakigrau" },
    "7009": { hex: "#4D5645", name: "Grüngrau" },
    "7010": { hex: "#4C514A", name: "Zeltgrau" },
    "7011": { hex: "#434B4D", name: "Eisengrau" },
    "7012": { hex: "#4E5754", name: "Basaltgrau" },
    "7013": { hex: "#464531", name: "Braungrau" },
    "7015": { hex: "#434750", name: "Schiefergrau" },
    "7016": { hex: "#293133", name: "Anthrazitgrau" },
    "7021": { hex: "#23282B", name: "Schwarzgrau" },
    "7022": { hex: "#332F2C", name: "Umbragrau" },
    "7023": { hex: "#686C5E", name: "Betongrau" },
    "7024": { hex: "#474A51", name: "Graphitgrau" },
    "7026": { hex: "#2F353B", name: "Granitgrau" },
    "7030": { hex: "#8B8C7A", name: "Steingrau" },
    "7031": { hex: "#474B4E", name: "Blaugrau" },
    "7032": { hex: "#B8B799", name: "Kieselgrau" },
    "7033": { hex: "#7D8471", name: "Zementgrau" },
    "7034": { hex: "#8F8B66", name: "Gelbgrau" },
    "7035": { hex: "#D7D7D7", name: "Lichtgrau" },
    "7036": { hex: "#7F7679", name: "Platingrau" },
    "7037": { hex: "#7D7F7D", name: "Staubgrau" },
    "7038": { hex: "#B5B8B1", name: "Achatgrau" },
    "7039": { hex: "#6C6960", name: "Quarzgrau" },
    "7040": { hex: "#9DA1AA", name: "Fenstergrau" },
    "7042": { hex: "#8D948D", name: "Verkehrsgrau A" },
    "7043": { hex: "#4E5452", name: "Verkehrsgrau B" },
    "7044": { hex: "#CAC4B0", name: "Seidengrau" },
    "7045": { hex: "#909090", name: "Telegrau 1" },
    "7046": { hex: "#82898F", name: "Telegrau 2" },
    "7047": { hex: "#D0D0D0", name: "Telegrau 4" },
    "7048": { hex: "#898176", name: "Perlmausgrau" },

    // RAL 8000 series - Brown
    "8000": { hex: "#826C34", name: "Grünbraun" },
    "8001": { hex: "#955F20", name: "Ockerbraun" },
    "8002": { hex: "#6C3B2A", name: "Signalbraun" },
    "8003": { hex: "#734222", name: "Lehmbraun" },
    "8004": { hex: "#8E402A", name: "Kupferbraun" },
    "8007": { hex: "#59351F", name: "Rehbraun" },
    "8008": { hex: "#6F4F28", name: "Olivbraun" },
    "8011": { hex: "#5B3A29", name: "Nussbraun" },
    "8012": { hex: "#592321", name: "Rotbraun" },
    "8014": { hex: "#382C1E", name: "Sepiabraun" },
    "8015": { hex: "#633A34", name: "Kastanienbraun" },
    "8016": { hex: "#4C2F27", name: "Mahagonibraun" },
    "8017": { hex: "#45322E", name: "Schokoladen­braun" },
    "8019": { hex: "#403A3A", name: "Graubraun" },
    "8022": { hex: "#212121", name: "Schwarzbraun" },
    "8023": { hex: "#A65E2E", name: "Orangebraun" },
    "8024": { hex: "#79553D", name: "Beigebraun" },
    "8025": { hex: "#755C48", name: "Blassbraun" },
    "8028": { hex: "#4E3B31", name: "Terrabraun" },
    "8029": { hex: "#763C28", name: "Perlkupfer" },

    // RAL 9000 series - White and Black
    "9001": { hex: "#FDF4E3", name: "Cremeweiß" },
    "9002": { hex: "#E7EBDA", name: "Grauweiß" },
    "9003": { hex: "#F4F4F4", name: "Signalweiß" },
    "9004": { hex: "#282828", name: "Signalschwarz" },
    "9005": { hex: "#0A0A0A", name: "Tiefschwarz" },
    "9006": { hex: "#A5A5A5", name: "Weißaluminium" },
    "9007": { hex: "#8F8F8F", name: "Graualuminium" },
    "9010": { hex: "#FFFFFF", name: "Reinweiß" },
    "9011": { hex: "#1C1C1C", name: "Graphitschwarz" },
    "9016": { hex: "#F6F6F6", name: "Verkehrsweiß" },
    "9017": { hex: "#1E1E1E", name: "Verkehrsschwarz" },
    "9018": { hex: "#D7D7D7", name: "Papyrusweiß" },
    "9022": { hex: "#9C9C9C", name: "Perlhellgrau" },
    "9023": { hex: "#828282", name: "Perldunkelgrau" },
};

/**
 * Get the hex color for a RAL code
 * @param ralCode - The RAL code (e.g., "7016", "9010")
 * @returns The hex color or null if not found
 */
export function getRalHexColor(ralCode: string): string | null {
    const normalized = ralCode.trim();
    const color = RAL_COLORS[normalized];
    return color ? color.hex : null;
}

/**
 * Get the name for a RAL code
 * @param ralCode - The RAL code
 * @returns The color name or null if not found
 */
export function getRalName(ralCode: string): string | null {
    const normalized = ralCode.trim();
    const color = RAL_COLORS[normalized];
    return color ? color.name : null;
}

/**
 * Check if a RAL code is valid (exists in our database)
 * @param ralCode - The RAL code to check
 * @returns true if the RAL code exists
 */
export function isValidRalCode(ralCode: string): boolean {
    return RAL_COLORS.hasOwnProperty(ralCode.trim());
}
