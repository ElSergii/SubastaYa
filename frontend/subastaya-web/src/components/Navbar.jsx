import React from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { FaGavel, FaWallet, FaUserGear, FaClockRotateLeft, FaRightFromBracket, FaRightToBracket, FaPlus, FaClipboardList } from 'react-icons/fa6';

export default function AppNavbar({ currentUser, wallet, currentTab, setCurrentTab, onOpenLogin, onLogout, onOpenCreateAuction }) {
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <Navbar 
      expand="lg" 
      sticky="top"
      className="glass-card py-2 border-0 border-bottom border-secondary mb-4"
      style={{ backgroundColor: 'rgba(9, 5, 10, 0.95)', backdropFilter: 'blur(16px)' }}
    >
      <Container>
        {/* Marca */}
        <Navbar.Brand 
          onClick={() => setCurrentTab('auctions')}
          className="d-flex align-items-center gap-2 cursor-pointer pe-3"
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center border border-warning"
            style={{ width: 34, height: 34, backgroundColor: 'rgba(201,168,76,0.15)' }}
          >
            <span className="text-warning fw-bold fs-6">✦</span>
          </div>
          <span className="serif fw-bold text-warning fs-4 tracking-tight">SubastaYa</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="subastaya-nav" className="border-secondary text-warning" />
        
        <Navbar.Collapse id="subastaya-nav">
          {/* Navegación */}
          <Nav className="me-auto gap-1">
            <Nav.Link 
              active={currentTab === 'auctions'} 
              onClick={() => setCurrentTab('auctions')}
              className={`d-flex align-items-center gap-2 px-3 fw-bold ${currentTab === 'auctions' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
            >
              <FaGavel /> Subastas
            </Nav.Link>

            <Nav.Link 
              active={currentTab === 'activities'} 
              onClick={() => setCurrentTab('activities')}
              className={`d-flex align-items-center gap-2 px-3 fw-bold ${currentTab === 'activities' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
            >
              <FaClipboardList /> Mis Actividades
            </Nav.Link>

            <Nav.Link 
              active={currentTab === 'wallet'} 
              onClick={() => setCurrentTab('wallet')}
              className={`d-flex align-items-center gap-2 px-3 fw-bold ${currentTab === 'wallet' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
            >
              <FaWallet /> {isAdmin ? 'Billetera & Recaudación' : 'Billetera Escrow'}
            </Nav.Link>

            {isAdmin && (
              <Nav.Link 
                active={currentTab === 'admin'} 
                onClick={() => setCurrentTab('admin')}
                className={`d-flex align-items-center gap-2 px-3 fw-bold ${currentTab === 'admin' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
              >
                <FaUserGear /> Crear Subasta (Admin)
              </Nav.Link>
            )}

            <Nav.Link 
              active={currentTab === 'audit'} 
              onClick={() => setCurrentTab('audit')}
              className={`d-flex align-items-center gap-2 px-3 fw-bold ${currentTab === 'audit' ? 'text-warning border-bottom border-warning border-2' : 'text-secondary'}`}
            >
              <FaClockRotateLeft /> Auditoría ACID
            </Nav.Link>
          </Nav>

          {/* Estado de usuario */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {/* Botón Publicar Subasta */}
            <Button
              size="sm"
              onClick={onOpenCreateAuction}
              className="btn-gold d-flex align-items-center gap-2 px-3 py-1.5 fw-bold"
              style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#09050a' }}
            >
              <FaPlus /> Publicar Subasta
            </Button>

            {currentUser ? (
              <>
                {wallet && (
                  <Badge 
                    bg="dark" 
                    className="border border-success text-success mono fw-bold px-3 py-2 d-flex align-items-center gap-2"
                  >
                    <FaWallet className="text-success" />
                    <span>Disp: ${wallet.availableBalance.toLocaleString('es-AR')}</span>
                  </Badge>
                )}

                {isAdmin && (
                  <Badge 
                    bg="dark" 
                    className="border border-warning text-warning fw-bold px-3 py-2 d-flex align-items-center gap-2"
                  >
                    <FaUserGear /> VENDEDOR / ADMIN
                  </Badge>
                )}

                {/* Perfil */}
                <div 
                  onClick={onOpenLogin}
                  className="d-flex align-items-center gap-2 px-3 py-1 rounded glass-card border border-secondary"
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ 
                      width: 28, 
                      height: 28, 
                      backgroundColor: isAdmin ? '#9b2335' : '#c9a84c', 
                      color: '#09050a',
                      fontSize: '0.8rem'
                    }}
                  >
                    {currentUser.avatar || currentUser.name.charAt(0)}
                  </div>
                  <span className="text-light fw-bold small">{currentUser.name}</span>
                </div>

                <Button
                  variant="link"
                  size="sm"
                  onClick={onLogout}
                  className="text-secondary text-decoration-none p-0 d-flex align-items-center gap-1 hover-danger ms-1"
                >
                  <FaRightFromBracket /> Salir
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={onOpenLogin}
                className="btn-gold d-flex align-items-center gap-2 px-3 py-2 fw-bold"
              >
                <FaRightToBracket /> Iniciar Sesión
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
