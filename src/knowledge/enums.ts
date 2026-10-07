/**
 * Curated AVS / practice enum lists for ERN 3.8.2.
 * Full AVS lives in vendor/ddex/avs/avs.xsd - list_enums can also parse it.
 */

export type EnumSet = {
  id: string
  title: string
  source: 'avs' | 'package-practice' | 'common-overlay'
  description: string
  values: Array<{ value: string; note?: string }>
}

export const ENUMS: Record<string, EnumSet> = {
  ParentalWarningType: {
    id: 'ParentalWarningType',
    title: 'ParentalWarningType',
    source: 'avs',
    description: 'Content advisory on release / resource territory details.',
    values: [
      { value: 'Explicit' },
      { value: 'NotExplicit' },
      { value: 'Unknown' },
      { value: 'NoAdviceAvailable' },
      { value: 'UserDefined', note: 'Requires UserDefinedValue attribute' },
    ],
  },
  DeliveryType: {
    id: 'DeliveryType',
    title: 'DeliveryType (BatchComplete)',
    source: 'package-practice',
    description: 'Intent of the package in MessageInBatch - not an ERN NewReleaseMessage child.',
    values: [
      { value: 'NewReleaseDelivery', note: 'First insert' },
      { value: 'ReDelivery', note: 'Metadata/content update' },
      { value: 'TakeDown', note: 'Remove from stores' },
    ],
  },
  CommercialModelType: {
    id: 'CommercialModelType',
    title: 'CommercialModelType',
    source: 'avs',
    description: 'How the consumer pays / accesses under DealTerms.',
    values: [
      { value: 'SubscriptionModel' },
      { value: 'PayAsYouGoModel' },
      { value: 'AdvertisementSupportedModel' },
      { value: 'FreeOfChargeModel' },
      { value: 'RightsClaimModel' },
      { value: 'UserDefined', note: 'Requires UserDefinedValue' },
    ],
  },
  UseType: {
    id: 'UseType',
    title: 'UseType (inside Usage)',
    source: 'avs',
    description: 'Allowed usages in DealTerms/Usage.',
    values: [
      { value: 'Stream' },
      { value: 'ConditionalDownload' },
      { value: 'PermanentDownload' },
      { value: 'OnDemandStream' },
      { value: 'NonInteractiveStream' },
      { value: 'UserDefined', note: 'Requires UserDefinedValue' },
    ],
  },
  ReleaseType: {
    id: 'ReleaseType',
    title: 'ReleaseType',
    source: 'avs',
    description: 'Form of the release. Compilation often emitted as UserDefined.',
    values: [
      { value: 'Album' },
      { value: 'Single' },
      { value: 'EP' },
      { value: 'Bundle' },
      { value: 'VideoAlbum' },
      { value: 'VideoSingle' },
      {
        value: 'UserDefined',
        note: 'e.g. UserDefinedValue="Compilation"',
      },
    ],
  },
  SoundRecordingType: {
    id: 'SoundRecordingType',
    title: 'SoundRecordingType',
    source: 'avs',
    description: 'Type of the sound recording resource.',
    values: [
      { value: 'MusicalWorkSoundRecording' },
      { value: 'NonMusicalWorkSoundRecording' },
      { value: 'SpokenWordSoundRecording' },
      { value: 'Unknown' },
      { value: 'UserDefined' },
    ],
  },
  TextType: {
    id: 'TextType',
    title: 'TextType',
    source: 'avs',
    description: 'Type of Text resource (lyrics, booklet, …).',
    values: [
      { value: 'LyricText' },
      { value: 'CaptioningText' },
      { value: 'EBook' },
      { value: 'LinerNotes' },
      { value: 'Unknown' },
      { value: 'UserDefined' },
    ],
  },
  ImageType: {
    id: 'ImageType',
    title: 'ImageType',
    source: 'avs',
    description: 'Type of Image resource.',
    values: [
      { value: 'FrontCoverImage' },
      { value: 'BackCoverImage' },
      { value: 'BookletBackImage' },
      { value: 'BookletFrontImage' },
      { value: 'Poster' },
      { value: 'Wallpaper' },
      { value: 'Unknown' },
      { value: 'UserDefined' },
    ],
  },
  HashSumAlgorithmType: {
    id: 'HashSumAlgorithmType',
    title: 'HashSumAlgorithmType',
    source: 'avs',
    description: 'Algorithm for HashSum. Packages almost always use MD5.',
    values: [
      { value: 'MD5' },
      { value: 'SHA1' },
      { value: 'SHA256' },
      { value: 'UserDefined' },
    ],
  },
  ArtistRole_common: {
    id: 'ArtistRole_common',
    title: 'ArtistRole (common + overlay)',
    source: 'common-overlay',
    description:
      'Subset of AVS ArtistRole plus instruments that typically need UserDefined in ERN 3.8.2 packaging.',
    values: [
      { value: 'MainArtist', note: 'Standard AVS' },
      { value: 'FeaturedArtist', note: 'Often ResourceContributor instead' },
      { value: 'Conductor', note: 'Standard AVS' },
      { value: 'Choir', note: 'Standard AVS' },
      { value: 'Ensemble', note: 'Standard AVS' },
      { value: 'Orchestra', note: 'Standard AVS' },
      { value: 'Programmer', note: 'Standard AVS (note spelling)' },
      {
        value: 'UserDefined:Vocals',
        note: '<ArtistRole UserDefinedValue="Vocals">UserDefined</ArtistRole>',
      },
      { value: 'UserDefined:Guitar' },
      { value: 'UserDefined:Synthesizer' },
      { value: 'UserDefined:Drums' },
      { value: 'UserDefined:Piano' },
      { value: 'UserDefined:Keyboards' },
      { value: 'UserDefined:Bass Guitar' },
      { value: 'UserDefined:Background Vocals' },
      { value: 'UserDefined:Rap' },
    ],
  },
  ResourceContributorRole_common: {
    id: 'ResourceContributorRole_common',
    title: 'ResourceContributorRole (common)',
    source: 'common-overlay',
    description: 'Production / engineering / featured roles on ResourceContributor.',
    values: [
      { value: 'Producer', note: 'Standard' },
      { value: 'GraphicDesigner', note: 'Standard' },
      { value: 'Editor', note: 'Standard' },
      { value: 'Mixer', note: 'Check AVS spelling used by your partner' },
      {
        value: 'UserDefined:Mixing Engineer',
      },
      { value: 'UserDefined:Mastering Engineer' },
      { value: 'UserDefined:Recording Engineer' },
      { value: 'UserDefined:Assistant Engineer' },
      { value: 'UserDefined:Co-Producer' },
      { value: 'UserDefined:Remixer' },
    ],
  },
  IndirectResourceContributorRole_common: {
    id: 'IndirectResourceContributorRole_common',
    title: 'IndirectResourceContributorRole (common)',
    source: 'common-overlay',
    description: 'Work contributors - Composer / Lyricist family.',
    values: [
      { value: 'Composer' },
      { value: 'Lyricist' },
      { value: 'ComposerLyricist' },
      { value: 'Arranger' },
      { value: 'Adapter' },
    ],
  },
  ProductType: {
    id: 'ProductType',
    title: 'ProductType (BatchComplete)',
    source: 'package-practice',
    description: 'Product class in MessageInBatch.',
    values: [
      { value: 'AudioProduct' },
      { value: 'VideoProduct' },
      { value: 'MixedMediaProduct' },
    ],
  },
}

export function listEnumIds(): Array<{ id: string; title: string; source: string }> {
  return Object.values(ENUMS).map((e) => ({
    id: e.id,
    title: e.title,
    source: e.source,
  }))
}

export function getEnum(id: string): EnumSet | undefined {
  const key = id.trim()
  if (ENUMS[key]) return ENUMS[key]
  const lower = key.toLowerCase()
  return Object.values(ENUMS).find(
    (e) => e.id.toLowerCase() === lower || e.title.toLowerCase() === lower,
  )
}