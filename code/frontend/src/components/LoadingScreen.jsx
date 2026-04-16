/**
 * Centered full-page spinner used while auth state is resolving or a page is loading.
 *
 * Props:
 * - message: optional override for the status copy under the spinner.
 */
export default function LoadingScreen({ message = 'Loading Campus Closet...' }) {
  return (
    <div className="page-shell centered-shell">
      <div className="panel narrow-panel text-center">
        <div className="spinner-ring" />
        <p className="muted-copy">{message}</p>
      </div>
    </div>
  )
}
