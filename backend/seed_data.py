import uuid
from datetime import date, datetime, timezone
from app.core.database import SessionLocal, engine, Base
import app.models
from app.core.security import get_password_hash
from app.models.tenant import Tenant
from app.models.user import User
from app.models.strategic import StrategicArea, StrategicObjective, Indicator
from app.models.project import Project, ProjectComponent, ProjectActivity, ActivityPlannedPeriod
from app.models.tracking import ActivityProgressReport, ProgressEvidence
from app.models.change_control import ProjectBaseline

def seed():
    print("Iniciando creación de tablas y datos semilla para el SGP Municipal...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Crear Municipio (Tenant)
        tenant = db.query(Tenant).filter(Tenant.code == "MUN-SUCRE-01").first()
        if not tenant:
            tenant = Tenant(
                code="MUN-SUCRE-01",
                name="Gobierno Autónomo Municipal de Sucre",
                department_state="Chuquisaca",
                country="Bolivia",
                slug="sucre",
                subscription_tier="enterprise",
                settings_json={"threshold_green": 90.0, "threshold_yellow": 70.0}
            )
            db.add(tenant)
            db.flush()
            print(f"Tenant creado: {tenant.name} ({tenant.id})")

        # 2. Crear Usuarios con Roles
        default_password = get_password_hash("admin123")
        users_seed = [
            ("alcalde@sgp.gob", "Alcalde Municipal", "alcalde"),
            ("director.obras@sgp.gob", "Ing. Roberto Fernández (Director Obras)", "director_area"),
            ("responsable.obras@sgp.gob", "Arq. Carlos Méndez (Residente de Obra)", "responsable_proyecto"),
            ("supervisor.fiscal@sgp.gob", "Ing. Laura Vargas (Fiscal de Obras)", "supervisor_fiscal"),
            ("planificacion@sgp.gob", "Lic. Patricia Morales (Planificación)", "planificacion"),
        ]

        users_dict = {}
        for email, full_name, role in users_seed:
            user = db.query(User).filter(User.tenant_id == tenant.id, User.email == email).first()
            if not user:
                user = User(
                    tenant_id=tenant.id,
                    email=email,
                    password_hash=default_password,
                    full_name=full_name,
                    role=role
                )
                db.add(user)
                db.flush()
                print(f"Usuario creado: {email} | Rol: {role}")
            users_dict[role] = user

        # 3. Crear Áreas Estratégicas
        area_infra = db.query(StrategicArea).filter(StrategicArea.tenant_id == tenant.id, StrategicArea.code == "AE-01").first()
        if not area_infra:
            area_infra = StrategicArea(
                tenant_id=tenant.id,
                code="AE-01",
                name="Infraestructura Urbana y Obras Públicas",
                description="Desarrollo de vialidad, drenaje y equipamiento urbano.",
                weight_percentage=50.0,
                order_index=1
            )
            db.add(area_infra)
            db.flush()

        area_humano = db.query(StrategicArea).filter(StrategicArea.tenant_id == tenant.id, StrategicArea.code == "AE-02").first()
        if not area_humano:
            area_humano = StrategicArea(
                tenant_id=tenant.id,
                code="AE-02",
                name="Desarrollo Humano, Educación y Salud",
                description="Infraestructura escolar, postas de salud y bienestar social.",
                weight_percentage=50.0,
                order_index=2
            )
            db.add(area_humano)
            db.flush()

        # 4. Objetivos e Indicadores
        obj1 = db.query(StrategicObjective).filter(StrategicObjective.tenant_id == tenant.id, StrategicObjective.code == "OE-01.01").first()
        if not obj1:
            obj1 = StrategicObjective(
                tenant_id=tenant.id,
                area_id=area_infra.id,
                code="OE-01.01",
                description="Mejorar la conectividad vial urbana y accesibilidad barrial",
                target_year=2026
            )
            db.add(obj1)
            db.flush()

        ind1 = db.query(Indicator).filter(Indicator.tenant_id == tenant.id, Indicator.code == "IND-VIA-01").first()
        if not ind1:
            ind1 = Indicator(
                tenant_id=tenant.id,
                objective_id=obj1.id,
                code="IND-VIA-01",
                name="Metros lineales de vías pavimentadas y empedradas",
                unit_of_measure="Metros lineales",
                baseline_value=0.0,
                target_value=2500.0,
                frequency="monthly",
                calculation_type="automatic_projects",
                verification_source="Actas de recepción y planillas de medición técnica"
            )
            db.add(ind1)
            db.flush()

        # 5. Proyecto 1: Pavimentación Av. Integración (Proyecto en Ruta - Semáforo Verde)
        proj1 = db.query(Project).filter(Project.tenant_id == tenant.id, Project.code == "PRY-2026-OB-01").first()
        if not proj1:
            proj1 = Project(
                tenant_id=tenant.id,
                strategic_area_id=area_infra.id,
                indicator_id=ind1.id,
                responsible_id=users_dict["responsable_proyecto"].id,
                supervisor_id=users_dict["supervisor_fiscal"].id,
                code="PRY-2026-OB-01",
                name="Pavimentación y Drenaje Pluvial Avenida Marcelo Quiroga Santa Cruz",
                description="Pavimentación rígida y obras de drenaje pluvial en el corredor troncal norte.",
                location_name="Distrito 2, Zona Hospital Universitario",
                latitude=-19.0280,
                longitude=-65.2630,
                budget_allocated=1850000.00,
                funding_source="Recursos Propios (IDH)",
                start_date_planned=date(2026, 1, 10),
                end_date_planned=date(2026, 8, 30),
                status="in_execution",
                baseline_frozen_at=datetime.now(timezone.utc)
            )
            db.add(proj1)
            db.flush()

            # Componente 1: Movimiento de Tierras (30%)
            c1 = ProjectComponent(tenant_id=tenant.id, project_id=proj1.id, code="C-01", name="Movimiento de tierras y subrasante", weight_percentage=30.0, order_index=1)
            # Componente 2: Pavimento Rígido (50%)
            c2 = ProjectComponent(tenant_id=tenant.id, project_id=proj1.id, code="C-02", name="Pavimentación con losas de hormigón", weight_percentage=50.0, order_index=2)
            # Componente 3: Drenaje y Señalización (20%)
            c3 = ProjectComponent(tenant_id=tenant.id, project_id=proj1.id, code="C-03", name="Cunetas de drenaje y señalización", weight_percentage=20.0, order_index=3)
            db.add_all([c1, c2, c3])
            db.flush()

            # Actividades para C1
            a1 = ProjectActivity(
                tenant_id=tenant.id, component_id=c1.id, code="ACT-01.01",
                name="Excavación y nivelación de plataforma", unit_of_measure="m3",
                total_target_quantity=4500.0, weight_percentage=100.0,
                start_date=date(2026, 1, 15), end_date=date(2026, 3, 15), order_index=1
            )
            db.add(a1)
            db.flush()

            # Programación para a1 (Meses 1, 2)
            db.add(ActivityPlannedPeriod(tenant_id=tenant.id, activity_id=a1.id, period_date=date(2026, 1, 1), planned_quantity=2000.0, planned_budget=150000.0))
            db.add(ActivityPlannedPeriod(tenant_id=tenant.id, activity_id=a1.id, period_date=date(2026, 2, 1), planned_quantity=2500.0, planned_budget=180000.0))

            # Reporte de avance real para a1 (aprobado por supervisor con 95% de cumplimiento)
            r1 = ActivityProgressReport(
                tenant_id=tenant.id, activity_id=a1.id, period_date=date(2026, 1, 1),
                quantity_executed=1950.0, reported_by_id=users_dict["responsable_proyecto"].id,
                supervisor_status="approved", supervisor_id=users_dict["supervisor_fiscal"].id,
                supervisor_reviewed_at=datetime.now(timezone.utc), supervisor_comments="Avance verificado en inspección visual y topográfica conforme a especificaciones."
            )
            db.add(r1)
            db.flush()

            # Evidencia fotográfica
            ev1 = ProgressEvidence(
                tenant_id=tenant.id, report_id=r1.id,
                file_name="inspeccion_maquinaria_sector_a.jpg",
                file_url="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800",
                file_type="image/jpeg", file_size_bytes=2450000,
                latitude=-19.0280, longitude=-65.2630,
                captured_at=datetime.now(timezone.utc),
                description="Equipo pesado realizando corte y perfilado en Av. Marcelo Quiroga Santa Cruz"
            )
            db.add(ev1)

        # 6. Proyecto 2: Construcción Centro de Salud Lajastambo (Semáforo Rojo)
        proj2 = db.query(Project).filter(Project.tenant_id == tenant.id, Project.code == "PRY-2026-ED-02").first()
        if not proj2:
            proj2 = Project(
                tenant_id=tenant.id,
                strategic_area_id=area_humano.id,
                responsible_id=users_dict["responsable_proyecto"].id,
                supervisor_id=users_dict["supervisor_fiscal"].id,
                code="PRY-2026-ED-02",
                name="Construcción Centro de Salud Integral Lajastambo Distrito 3",
                description="Construcción de infraestructura médica de primer nivel con sala de partos.",
                location_name="Distrito 3, Zona Lajastambo",
                latitude=-19.0065,
                longitude=-65.2890,
                budget_allocated=2400000.00,
                funding_source="Tesoro General de la Nación (TGN)",
                start_date_planned=date(2026, 2, 1),
                end_date_planned=date(2026, 11, 30),
                status="in_execution",
                baseline_frozen_at=datetime.now(timezone.utc)
            )
            db.add(proj2)
            db.flush()

            c2_1 = ProjectComponent(tenant_id=tenant.id, project_id=proj2.id, code="C-01", name="Fundaciones y estructura de hormigón", weight_percentage=50.0, order_index=1)
            c2_2 = ProjectComponent(tenant_id=tenant.id, project_id=proj2.id, code="C-02", name="Obra gruesa e instalaciones", weight_percentage=50.0, order_index=2)
            db.add_all([c2_1, c2_2])
            db.flush()

            a2_1 = ProjectActivity(
                tenant_id=tenant.id, component_id=c2_1.id, code="ACT-01.01",
                name="Vaciado de zapatas y columnas primer piso", unit_of_measure="m3",
                total_target_quantity=300.0, weight_percentage=100.0,
                start_date=date(2026, 2, 5), end_date=date(2026, 4, 30), order_index=1
            )
            db.add(a2_1)
            db.flush()

            # Meta programada 150 m3 para mes 1, pero solo ejecutaron 30 m3 (atraso crítico < 70%)
            db.add(ActivityPlannedPeriod(tenant_id=tenant.id, activity_id=a2_1.id, period_date=date(2026, 2, 1), planned_quantity=150.0, planned_budget=400000.0))
            r2 = ActivityProgressReport(
                tenant_id=tenant.id, activity_id=a2_1.id, period_date=date(2026, 2, 1),
                quantity_executed=35.0, reported_by_id=users_dict["responsable_proyecto"].id,
                supervisor_status="approved", supervisor_id=users_dict["supervisor_fiscal"].id,
                supervisor_reviewed_at=datetime.now(timezone.utc), supervisor_comments="Atraso severo por lluvias e incumplimiento en la provisión de fierro corrugado."
            )
            db.add(r2)

        # 7. Proyecto 3: Casco Histórico Plaza 25 de Mayo (Semáforo Verde - 97%)
        proj3 = db.query(Project).filter(Project.tenant_id == tenant.id, Project.code == "PRY-2026-CH-03").first()
        if not proj3:
            proj3 = Project(
                tenant_id=tenant.id,
                strategic_area_id=area_infra.id,
                responsible_id=users_dict["responsable_proyecto"].id,
                supervisor_id=users_dict["supervisor_fiscal"].id,
                code="PRY-2026-CH-03",
                name="Restauración y Puesta en Valor Casco Histórico - Plaza 25 de Mayo",
                description="Restauración de aceras patrimoniales, iluminación arquitectónica LED y revitalización urbana.",
                location_name="Distrito 1, Centro Histórico - Plaza 25 de Mayo",
                latitude=-19.0483,
                longitude=-65.2602,
                budget_allocated=1250000.00,
                funding_source="Recursos Propios (IDH)",
                start_date_planned=date(2026, 1, 5),
                end_date_planned=date(2026, 9, 15),
                status="in_execution",
                baseline_frozen_at=datetime.now(timezone.utc)
            )
            db.add(proj3)
            db.flush()

            c3_1 = ProjectComponent(tenant_id=tenant.id, project_id=proj3.id, code="C-01", name="Tratamiento de aceras y fachadas patrimoniales", weight_percentage=60.0, order_index=1)
            c3_2 = ProjectComponent(tenant_id=tenant.id, project_id=proj3.id, code="C-02", name="Iluminación escénica y cableado subterráneo", weight_percentage=40.0, order_index=2)
            db.add_all([c3_1, c3_2])
            db.flush()

            a3_1 = ProjectActivity(
                tenant_id=tenant.id, component_id=c3_1.id, code="ACT-01.01",
                name="Desmontaje de baldosas y reposición de pavimento colonial", unit_of_measure="m2",
                total_target_quantity=1800.0, weight_percentage=100.0,
                start_date=date(2026, 1, 10), end_date=date(2026, 4, 30), order_index=1
            )
            db.add(a3_1)
            db.flush()

            db.add(ActivityPlannedPeriod(tenant_id=tenant.id, activity_id=a3_1.id, period_date=date(2026, 1, 1), planned_quantity=600.0, planned_budget=200000.0))
            r3 = ActivityProgressReport(
                tenant_id=tenant.id, activity_id=a3_1.id, period_date=date(2026, 1, 1),
                quantity_executed=580.0, reported_by_id=users_dict["responsable_proyecto"].id,
                supervisor_status="approved", supervisor_id=users_dict["supervisor_fiscal"].id,
                supervisor_reviewed_at=datetime.now(timezone.utc), supervisor_comments="Alineamiento y cantería colonial en perfecto estado según catálogo patrimonial."
            )
            db.add(r3)
            db.flush()

            ev3 = ProgressEvidence(
                tenant_id=tenant.id, report_id=r3.id,
                file_name="restauracion_plaza_25_mayo.jpg",
                file_url="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
                file_type="image/jpeg", file_size_bytes=1900000,
                latitude=-19.0483, longitude=-65.2602,
                captured_at=datetime.now(timezone.utc),
                description="Trabajos de calzada y acera patrimonial frente a la Casa de la Libertad"
            )
            db.add(ev3)

        # 8. Proyecto 4: UE San Juanillo (Semáforo Amarillo - 77%)
        proj4 = db.query(Project).filter(Project.tenant_id == tenant.id, Project.code == "PRY-2026-ED-04").first()
        if not proj4:
            proj4 = Project(
                tenant_id=tenant.id,
                strategic_area_id=area_humano.id,
                responsible_id=users_dict["responsable_proyecto"].id,
                supervisor_id=users_dict["supervisor_fiscal"].id,
                code="PRY-2026-ED-04",
                name="Construcción Módulos Aulas y Coliseo Unidad Educativa San Juanillo",
                description="Infraestructura educativa de 8 aulas modernas, batería sanitaria y tinglado polideportivo.",
                location_name="Distrito 5, Barrio San Juanillo",
                latitude=-19.0345,
                longitude=-65.2490,
                budget_allocated=1890000.00,
                funding_source="Recursos Específicos Municipales",
                start_date_planned=date(2026, 2, 10),
                end_date_planned=date(2026, 10, 20),
                status="in_execution",
                baseline_frozen_at=datetime.now(timezone.utc)
            )
            db.add(proj4)
            db.flush()

            c4_1 = ProjectComponent(tenant_id=tenant.id, project_id=proj4.id, code="C-01", name="Bloque pedagógico de dos plantas", weight_percentage=60.0, order_index=1)
            c4_2 = ProjectComponent(tenant_id=tenant.id, project_id=proj4.id, code="C-02", name="Cubierta metálica tinglado y graderías", weight_percentage=40.0, order_index=2)
            db.add_all([c4_1, c4_2])
            db.flush()

            a4_1 = ProjectActivity(
                tenant_id=tenant.id, component_id=c4_1.id, code="ACT-01.01",
                name="Estructuras de hormigón armado y zapatas aisladas", unit_of_measure="m3",
                total_target_quantity=220.0, weight_percentage=100.0,
                start_date=date(2026, 2, 15), end_date=date(2026, 5, 30), order_index=1
            )
            db.add(a4_1)
            db.flush()

            db.add(ActivityPlannedPeriod(tenant_id=tenant.id, activity_id=a4_1.id, period_date=date(2026, 2, 1), planned_quantity=80.0, planned_budget=250000.0))
            r4 = ActivityProgressReport(
                tenant_id=tenant.id, activity_id=a4_1.id, period_date=date(2026, 2, 1),
                quantity_executed=62.0, reported_by_id=users_dict["responsable_proyecto"].id,
                supervisor_status="approved", supervisor_id=users_dict["supervisor_fiscal"].id,
                supervisor_reviewed_at=datetime.now(timezone.utc), supervisor_comments="Ligero retraso en armado de encofrados por abastecimiento de madera."
            )
            db.add(r4)

        db.commit()
        print("\n ¡Datos Semilla insertados exitosamente!")
        print("\n Credenciales de Acceso para Pruebas:")
        print("  * Alcalde:             alcalde@sgp.gob          / admin123")
        print("  * Director de Área:    director.obras@sgp.gob   / admin123")
        print("  * Responsable Obra:    responsable.obras@sgp.gob / admin123")
        print("  * Supervisor Fiscal:   supervisor.fiscal@sgp.gob / admin123")
        print("  * Planificación:       planificacion@sgp.gob    / admin123")

    except Exception as e:
        db.rollback()
        print(f"Error cargando seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()

