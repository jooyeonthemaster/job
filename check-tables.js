// 실제 Supabase DB 테이블 목록 확인
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kzovapvythsgskklmukj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6b3ZhcHZ5dGhzZ3Nra2xtdWtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQyMzU2NSwiZXhwIjoyMDc1OTk5NTY1fQ.AAORVl6MScaxPlryY34fzRFfHcfqFgU92Fw5B4OzJYA'
);

async function checkTables() {
  // PostgreSQL 시스템 테이블에서 public 스키마의 테이블 목록 조회
  const { data, error } = await supabase
    .from('pg_catalog.pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log('\n📊 실제 Supabase DB의 public 테이블 목록:\n');
  data.forEach(table => {
    console.log(`  - ${table.tablename}`);
  });
  console.log(`\n총 ${data.length}개 테이블\n`);

  // profile_view_payments 테이블이 있는지 확인
  const hasProfilePayments = data.some(t => t.tablename === 'profile_view_payments');
  console.log(hasProfilePayments
    ? '✅ profile_view_payments 테이블 존재'
    : '❌ profile_view_payments 테이블 없음 (마이그레이션 필요!)');
}

checkTables().catch(console.error);
