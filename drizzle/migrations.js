// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_lovely_marten_broadcloak.sql';
import m0001 from './0001_bouncy_captain_midlands.sql';
import m0002 from './0002_flaky_sue_storm.sql';
import m0003 from './0003_lame_crusher_hogan.sql';
import m0004 from './0004_sudden_captain_stacy.sql';
import m0005 from './0005_polite_carnage.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005
    }
  }
  