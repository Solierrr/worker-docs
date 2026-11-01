import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GroupAction, SurfaceGroup } from "@solaria.network/web-lib";
import { IconBook2, IconLayoutGrid } from "@tabler/icons-react";
import previews from "@/content/previews.json";
import { isSupportedLanguage } from "@/config/i18n/languages";

type Locale = "pt-BR" | "en-US" | "es-ES";

// Lista dos ambientes de preview. Cada cartão abre o preview servido pelo próprio portal (/previews/<repositório>/).
export default function PreviewsPage() {
  const { t, i18n } = useTranslation("docs");
  const { lang } = useParams<{ lang: string }>();
  const locale = (isSupportedLanguage(i18n.language) ? i18n.language : "pt-BR") as Locale;

  // /pt-BR/previews, /en-US/previews e /es-ES/previews (os links dos previews) trocam o idioma do portal
  useEffect(() => {
    if (isSupportedLanguage(lang) && lang !== i18n.language) void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <main className="flex-1">
      <header className="mx-auto max-w-160 px-4 pt-10 text-center md:pt-14">
        <h1 className="mb-4 text-title font-extra-bold leading-tight tracking-tight text-operational-ink">{t("previews.title")}</h1>
        <p className="text-label leading-8 text-operational-muted">{t("previews.description")}</p>
      </header>
      <section aria-label={t("previews.list")} className="mx-auto w-full max-w-160 px-4 pt-10 pb-16">
        <SurfaceGroup>
          {previews.map((preview) => {
            const Glyph = preview.kind === "storybook" ? IconBook2 : IconLayoutGrid;
            const title = preview.title[locale];
            return (
              <GroupAction
                key={preview.name}
                to={`/previews/${preview.name}/`}
                reloadDocument
                label={title}
                content={title}
                detail={`${t(`previews.kind.${preview.kind}`)}: ${preview.description[locale]}`}
                glyph={<Glyph size={20} stroke={1.75} aria-hidden="true" />}
              />
            );
          })}
        </SurfaceGroup>
      </section>
    </main>
  );
}
