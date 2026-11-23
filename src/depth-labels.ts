// Structural-depth display labels: the catalog grids' tier headers, the
// fusion screen's tier heads, and the build graph's rows all name depth
// 0/1/2 the same way. One definition, imported by both sides — the build
// graph must not import renderer internals, and the renderer must not own
// the graph's row model.
import { t } from './i18n';

export const DEPTH_LABELS = [t('tier.basic'), t('tier.evolved'), t('tier.tier3')] as const;
