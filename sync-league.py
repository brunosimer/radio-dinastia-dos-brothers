import json, urllib.request, concurrent.futures, datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parent
BASE='https://api.sleeper.app/v1/'
LEAGUE='1389772055477489664'
def get(path):
 return json.load(urllib.request.urlopen(BASE+path,timeout=30))
def main():
 league=get('league/'+LEAGUE); week=int(league['settings'].get('leg',1))
 paths={'users':f'league/{LEAGUE}/users','rosters':f'league/{LEAGUE}/rosters','matchups':f'league/{LEAGUE}/matchups/{week}','transactions':f'league/{LEAGUE}/transactions/{week}','previous_transactions':f'league/{LEAGUE}/transactions/{max(0,week-1)}','players':'players/nfl'}
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  values=dict(zip(paths,pool.map(get,paths.values())))
 ids=set()
 for r in values['rosters']:ids.update(r.get('players') or [])
 for tx in values['transactions']+values.pop('previous_transactions'):
  ids.update((tx.get('adds') or {}).keys());ids.update((tx.get('drops') or {}).keys())
  if tx not in values['transactions']:values['transactions'].append(tx)
 values['players']={i:{k:values['players'].get(i,{}).get(k) for k in ['full_name','first_name','last_name','position','team','injury_status']} for i in ids}
 values['league']=league; values['week']=week;values['fetched_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
 (ROOT/'league-data.json').write_text(json.dumps(values,ensure_ascii=False,separators=(',',':')))
 print('Snapshot atualizado:',week,len(values['rosters']),'times')
if __name__=='__main__':main()
