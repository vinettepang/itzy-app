import logoLabs from '../assets/ui/logo-labs.svg?raw'
import sideLeft from '../assets/ui/side-left.svg?raw'
import sideRight from '../assets/ui/side-right.svg?raw'

function InlineSvg({ markup, className }: { markup: string; className?: string }) {
  return (
    <div
      className={className}
      // SVG from production markup; safe static asset
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export default function UiDecor() {
  return (
    <>
      <div className="corner corner--top">
        <InlineSvg markup={logoLabs} className="svg-fill-color" />
      </div>
      <div className="corner corner--left">
        <InlineSvg markup={sideLeft} className="svg-fill-color" />
      </div>
      <div className="corner corner--right">
        <InlineSvg markup={sideRight} className="svg-fill-color" />
      </div>
    </>
  )
}
