/**
 * Element / attribute knowledge cards for ERN 3.8.2.
 * Focused on what agents need when composing or debugging packages.
 */

export type ElementCard = {
  name: string
  kind: 'element' | 'attribute' | 'concept'
  summary: string
  where: string[]
  required?: string
  type?: string
  avs?: string
  spelling?: string[]
  related?: string[]
}

export const ELEMENTS: Record<string, ElementCard> = {
  NewReleaseMessage: {
    name: 'NewReleaseMessage',
    kind: 'element',
    summary:
      'Root of an ERN 3.8.2 release notification. Used for insert and update; takedown intent is expressed via BatchComplete DeliveryType, not a different root.',
    where: ['document root'],
    required: 'MessageHeader, ResourceList, ReleaseList; DealList for commercial packages',
    spelling: [
      'xmlns:ern="http://ddex.net/xml/ern/382"',
      'MessageSchemaVersionId="ern/382"',
      'Optional LanguageAndScriptCode on the root (IETF BCP 47 / RfC 5646)',
    ],
    related: ['MessageHeader', 'ResourceList', 'ReleaseList', 'DealList'],
  },
  MessageSchemaVersionId: {
    name: 'MessageSchemaVersionId',
    kind: 'attribute',
    summary: 'Must be ern/382 for this profile.',
    where: ['NewReleaseMessage'],
    spelling: ['MessageSchemaVersionId="ern/382"'],
  },
  ICPN: {
    name: 'ICPN',
    kind: 'element',
    summary:
      'International Code Product Number - UPC/EAN for the release. Commonly carried with IsEan="true".',
    where: ['ReleaseId', 'IncludedReleaseId', 'BatchComplete'],
    type: 'string (digits)',
    related: ['ReleaseId', 'ISRC'],
  },
  ISRC: {
    name: 'ISRC',
    kind: 'element',
    summary: 'International Standard Recording Code for a SoundRecording.',
    where: ['SoundRecordingId'],
    type: '12-char ISRC',
    related: ['SoundRecordingId', 'ICPN'],
  },
  ResourceReference: {
    name: 'ResourceReference',
    kind: 'element',
    summary:
      'Local resource anchor inside the message. XSD pattern requires it to start with letter A.',
    where: ['SoundRecording', 'Image', 'Text', 'Video', '…'],
    spelling: ['A1', 'A2', 'A1001 (lyrics convention in some pipelines)'],
    type: 'xs:ID pattern A[\\d\\-_a-zA-Z]+',
  },
  ReleaseReference: {
    name: 'ReleaseReference',
    kind: 'element',
    summary: 'Local release anchor, typically R0 for the main release.',
    where: ['Release'],
    spelling: ['R0'],
  },
  ParentalWarningType: {
    name: 'ParentalWarningType',
    kind: 'element',
    summary:
      'Explicitness classification. Track-level and release-level; release is often Explicit if any track is.',
    where: ['ReleaseDetailsByTerritory', 'SoundRecordingDetailsByTerritory', 'TextDetailsByTerritory'],
    avs: 'ParentalWarningType',
    spelling: ['Explicit', 'NotExplicit', 'Unknown', 'UserDefined'],
  },
  IsInstrumental: {
    name: 'IsInstrumental',
    kind: 'element',
    summary:
      'Boolean on SoundRecording. When true, omit LanguageOfPerformance and do not attach Lyricist. When false, LanguageOfPerformance is expected for vocal works.',
    where: ['SoundRecording'],
    type: 'xs:boolean',
    related: ['LanguageOfPerformance', 'Duration'],
  },
  LanguageOfPerformance: {
    name: 'LanguageOfPerformance',
    kind: 'element',
    summary: 'ISO 639-2 language of the performance. Place after IsInstrumental flags, before Duration.',
    where: ['SoundRecording', 'Release (optional)'],
    avs: 'IsoLanguageCode',
    spelling: ['Omit when IsInstrumental=true'],
  },
  Duration: {
    name: 'Duration',
    kind: 'element',
    summary: 'ISO 8601 duration. Example: PT3M15S, PT1H2M3.5S.',
    where: ['SoundRecording', 'Release (optional)', 'Technical*'],
    type: 'xs:duration',
    spelling: ['PT#H#M#S - lower-case variables, upper-case designators'],
  },
  DisplayArtist: {
    name: 'DisplayArtist',
    kind: 'element',
    summary:
      'Party shown as artist. Carry PartyName, optional PartyId (store profile namespaces), ArtistRole (MainArtist + instrument roles).',
    where: ['ReleaseDetailsByTerritory', 'SoundRecordingDetailsByTerritory', 'ResourceGroup'],
    related: ['ArtistRole', 'PartyId', 'ResourceContributor'],
  },
  ArtistRole: {
    name: 'ArtistRole',
    kind: 'element',
    summary:
      'Role on DisplayArtist. Standard AVS values (MainArtist, Conductor, …) as text; instruments often need UserDefined + UserDefinedValue.',
    where: ['DisplayArtist'],
    avs: 'ArtistRole',
    spelling: [
      '<ArtistRole>MainArtist</ArtistRole>',
      '<ArtistRole UserDefinedValue="Vocals">UserDefined</ArtistRole>',
    ],
  },
  ResourceContributor: {
    name: 'ResourceContributor',
    kind: 'element',
    summary:
      'Direct contributor (Producer, Mixing Engineer, FeaturedArtist, …). At track level under SDBT; at release level inside ResourceGroup.',
    where: ['SoundRecordingDetailsByTerritory', 'ResourceGroup', '…'],
    related: ['ResourceContributorRole', 'IndirectResourceContributor'],
  },
  IndirectResourceContributor: {
    name: 'IndirectResourceContributor',
    kind: 'element',
    summary:
      'Work-level contributor: Composer, Lyricist, ComposerLyricist. Full legal name (not stage name) is industry practice for Composer/Lyricist.',
    where: ['SoundRecordingDetailsByTerritory', 'ResourceGroup'],
    related: ['IndirectResourceContributorRole'],
  },
  PLine: {
    name: 'PLine',
    kind: 'element',
    summary:
      'Phonogram rights line (year + text/company). On the release it must sit inside ReleaseDetailsByTerritory.',
    where: ['ReleaseDetailsByTerritory', 'SoundRecordingDetailsByTerritory'],
    spelling: ['Year + PLineText (and/or PLineCompany)'],
  },
  CLine: {
    name: 'CLine',
    kind: 'element',
    summary: 'Copyright line. Same placement rules as PLine - inside RDBT for the release.',
    where: ['ReleaseDetailsByTerritory'],
    related: ['PLine'],
  },
  Genre: {
    name: 'Genre',
    kind: 'element',
    summary:
      'GenreText + optional SubGenre. ERN leaves GenreText as free string; many DSPs/aggregators constrain to their catalog.',
    where: ['ReleaseDetailsByTerritory', 'SoundRecordingDetailsByTerritory'],
    spelling: ['<Genre><GenreText>…</GenreText><SubGenre>…</SubGenre></Genre>'],
  },
  DistributionChannel: {
    name: 'DistributionChannel',
    kind: 'element',
    summary:
      'Target store/shop under DealTerms. PartyId is the channel id; TradingName optional. Place before ValidityPeriod in common order.',
    where: ['DealTerms'],
    related: ['DealTerms', 'CommercialModelType'],
  },
  DeliveryType: {
    name: 'DeliveryType',
    kind: 'element',
    summary:
      'BatchComplete intent: NewReleaseDelivery (insert), ReDelivery (update), TakeDown.',
    where: ['MessageInBatch / BatchComplete'],
    spelling: ['NewReleaseDelivery', 'ReDelivery', 'TakeDown'],
  },
  HashSum: {
    name: 'HashSum',
    kind: 'element',
    summary:
      'Integrity hash. Inside File or MessageInBatch: child HashSum (value) + HashSumAlgorithmType (usually MD5).',
    where: ['File', 'MessageInBatch'],
    avs: 'HashSumAlgorithmType',
  },
  File: {
    name: 'File',
    kind: 'element',
    summary:
      'Points at a payload. Choice of URL or FileName (+ optional FilePath), then optional HashSum. Element FileURL does not exist in ERN 3.8.2. FileSize is not a child of File.',
    where: ['TechnicalSoundRecordingDetails', 'TechnicalImageDetails', 'TechnicalTextDetails'],
    spelling: ['Relative paths recommended for packages'],
    related: ['HashSum', 'URL'],
  },
  Text: {
    name: 'Text',
    kind: 'element',
    summary:
      'Text resource in ResourceList. Lyrics: TextType=LyricText, linked from SoundRecording via ResourceContainedResourceReferenceList.',
    where: ['ResourceList'],
    spelling: ['ResourceReference still A[…]', 'TextType LyricText'],
  },
  GlobalReleaseDate: {
    name: 'GlobalReleaseDate',
    kind: 'element',
    summary: 'Release-level availability date after RDBT. Pair with GlobalOriginalReleaseDate when known.',
    where: ['Release'],
    type: 'EventDate / ISO date',
    related: ['ReleaseDate', 'OriginalReleaseDate', 'GlobalOriginalReleaseDate'],
  },
  ReleaseType: {
    name: 'ReleaseType',
    kind: 'element',
    summary:
      'Single, Album, EP, etc. Compilation is often UserDefined with UserDefinedValue="Compilation" when not in the AVS subset you emit.',
    where: ['Release', 'ReleaseDetailsByTerritory'],
    avs: 'ReleaseType',
  },
  BatchComplete: {
    name: 'BatchComplete',
    kind: 'concept',
    summary:
      'Package-level manifest listing MessageInBatch entries. Must be filled (not blank), use relative URLs, include DeliveryType and MD5, and be transferred last in FTP binary mode.',
    where: ['package root'],
    related: ['DeliveryType', 'HashSum', 'MessageInBatch'],
  },
  PartyId: {
    name: 'PartyId',
    kind: 'element',
    summary:
      'Party identifier. Optional Namespace attribute for store artist profiles (vendor-specific values) or DPID-style ids.',
    where: ['DisplayArtist', 'ResourceContributor', 'MessageSender', 'DistributionChannel'],
  },
}

export function explainElement(name: string): ElementCard | undefined {
  const key = name.trim()
  if (ELEMENTS[key]) return ELEMENTS[key]
  const lower = key.toLowerCase()
  return Object.values(ELEMENTS).find((e) => e.name.toLowerCase() === lower)
}

export function listElements(): Array<{ name: string; kind: string; summary: string }> {
  return Object.values(ELEMENTS).map((e) => ({
    name: e.name,
    kind: e.kind,
    summary: e.summary,
  }))
}