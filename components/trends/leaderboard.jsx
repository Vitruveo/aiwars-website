'use client';

const FONT = 'var(--aw-mono), ui-monospace, monospace';

const NUM = { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

function shortAddr(a) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function Leaderboard({ rows, myAddress }) {

  return (
    <div className="aw-panel p-3 p-md-4 mt-4">
      <h2 className="aw-kicker mb-3" style={{ fontSize: '0.95rem' }}>Leaderboard</h2>
      {!rows?.length ? (
        <p className="aw-faint mb-0" style={{ fontFamily: FONT, letterSpacing: '0.08em' }}>No games settled yet. The first hit takes the top row.</p>
      ) : (
      <div className="table-responsive">
        <table className="ols-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '3rem' }}>#</th>
              <th>Player</th>
              <th style={NUM}>VTRU spent</th>
              <th style={NUM}>Credits won</th>
              <th style={NUM}>Played</th>
              <th style={NUM}>Won</th>
              <th style={NUM}>Tier 1</th>
              <th style={NUM}>Tier 5 won</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const mine = myAddress && row.address.toLowerCase() === myAddress.toLowerCase();
              return (
                <tr key={row.address} style={mine ? { color: '#2d8cff' } : undefined}>
                  <td>{i + 1}</td>
                  <td style={{ fontFamily: FONT }}>
                    {row.name ? (
                      <span className={mine ? '' : 'text-white'} title={row.address} style={{ cursor: 'default' }}>
                        {row.name}
                      </span>
                    ) : (
                      <span title={row.address} style={{ cursor: 'default' }}>{shortAddr(row.address)}</span>
                    )}
                    {mine ? ' (you)' : ''}
                  </td>
                  <td style={NUM}>{fmt(row.spent)}</td>
                  <td style={NUM}>{fmt(row.credits)}</td>
                  <td style={NUM}>{row.played}</td>
                  <td style={NUM}>{row.won}</td>
                  <td style={NUM}>{row.tier1 ?? '…'}</td>
                  <td style={NUM}>{row.tier5}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
