-- Test d'accès : à exécuter dans le SQL Editor (ou psql) APRÈS la migration. Tout est annulé à la fin (rollback).
-- Échoue (exception) si une règle d'isolation est violée.
begin;
  insert into auth.users (id, aud, role, email) values
    ('00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'a@test.invalid'),
    ('00000000-0000-0000-0000-0000000000b2', 'authenticated', 'authenticated', 'b@test.invalid');

  set local role authenticated;
  select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  insert into academik.events (id, level, item, credit, t) values (gen_random_uuid(), '2.1', 'c4', 1, now());

  -- A ne peut pas écrire pour B
  do $$ begin
    begin
      insert into academik.events (id, user_id, level, item, credit, t)
        values (gen_random_uuid(), '00000000-0000-0000-0000-0000000000b2', '2.1', 'c4', 1, now());
      raise exception 'FAIL: A a écrit pour B';
    exception when insufficient_privilege or check_violation then null; end;
  end $$;

  select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
  do $$ begin
    if (select count(*) from academik.events) <> 0 then raise exception 'FAIL: B voit les données de A'; end if;
  end $$;

  -- Journal en ajout seul : ni update ni delete
  select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
  do $$ begin
    begin update academik.events set credit = 0; raise exception 'FAIL: update autorisé';
    exception when insufficient_privilege then null; end;
    begin delete from academik.events; raise exception 'FAIL: delete autorisé';
    exception when insufficient_privilege then null; end;
  end $$;

  -- Effacement RGPD
  select academik.erase_my_data();
  do $$ begin if (select count(*) from academik.events) <> 0 then raise exception 'FAIL: erase_my_data'; end if; end $$;

  -- anon n'a aucun accès
  reset role; set local role anon;
  do $$ begin
    begin perform 1 from academik.events; raise exception 'FAIL: anon lit events';
    exception when insufficient_privilege then null; end;
  end $$;
rollback;
select 'academik RLS : OK' as resultat;
